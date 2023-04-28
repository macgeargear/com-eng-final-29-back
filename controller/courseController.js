const dotenv = require("dotenv");
dotenv.config();
const { v4: uuidv4 } = require("uuid");
const { DynamoDBClient, QueryCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const {
  PutCommand,
  DeleteCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const docClient = new DynamoDBClient({ regions: process.env.AWS_REGION });

exports.getGroupMembers = async (req, res) => {
  const params = {
    TableName: process.env.aws_group_members_table_name,
  };
  try {
    const data = await docClient.send(new ScanCommand(params));
    res.send(data.Items);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

// TODO #1.1: Get items from DynamoDB
exports.getItems = async (req, res) => {
  // You should change the response below.
  const params = {
    TableName: process.env.aws_course_table_name,
  };
  try {
    const data = await docClient.send(new ScanCommand(params));
    console.log(data);
    res.send(data.Items);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

exports.getItemById = async (req, res) => {
  // You should change the response below.
  const targetCode = req.params.code;
  const params = {
    TableName: process.env.aws_course_table_name,
    ExpressionAttributeValues: {
      ":code": { S: targetCode },
    },
    KeyConditionExpression: "courseCode = :code",
  };

  try {
    const data = await docClient.send(new QueryCommand(params));
    console.log(data);
    const response = data.Items.map((item) => {
      const itemObject = {};
      for (const [key, value] of Object.entries(item)) {
        itemObject[key] = value.S || value.N || value.SS || value.NS || value.L || value.M || value.BOOL || value.NULL || value.B || value.BS;
        if(key == 'assignments'){
        //   itemObject[key] = Object.entries(itemObject[key]).map((thisAssignmentCodeData) => {
        //       return thisAssignmentCodeData[1];
        //   })
            const assignments = [];
            for (const detail of Object.entries(itemObject[key])){
                assignments.push(detail[1].S);
                // console.log(detail);
            }
            itemObject[key] = assignments;
        }
      }
      return itemObject;
    });
    if(response.length == 0){
      res.send({"message": "courseCode not found"});
    }else{
      res.send({...response[0], "message": "ok"});
    }
    res.send();
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

// TODO #1.2: Add an item to DynamoDB
exports.addItem = async (req, res) => {
  const item_id = uuidv4();
  const created_date = Date.now();
  // const item = { item_id: item_id, ...req.body, created_date: created_date };
  const item = { ...req.body, created_date: created_date };


  const params = {
    TableName: process.env.aws_course_table_name,
    Item: item,
  };

  try {
    await docClient.send(new PutCommand(params));
    res.send(item);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

exports.updateItem = async (req, res) => {
    const courseCode = req.params.code;
    const newValue = req.params.new_val.split(',').map((value)=>{return {S: value}});
    
    console.log(newValue);
    // console.log(`update on ${courseCode} with ${newValue.join(',')}`)
    const params = {
      TableName: process.env.aws_course_table_name,
      Key: {'courseCode': {S: courseCode}},
      UpdateExpression: 'SET #attr1 = :newValue',
      ExpressionAttributeNames: { '#attr1': 'assignments' },
      ExpressionAttributeValues: {':newValue': { L : newValue}}
    };
  
    try {
        const data = await docClient.send(new UpdateItemCommand(params));
        console.log(data);
        res.send({message: "update complete"});
      } catch (err) {
        console.error(err);
        res.status(500).send(err);
      }
  };

// TODO #1.3: Delete an item from DynamDB
exports.deleteItem = async (req, res) => {
  const targetCode = req.params.code;

  const params = {
    TableName: process.env.aws_course_table_name,
    Key: {
      courseCode: targetCode,
    },
  };

  try {
    await docClient.send(new DeleteCommand(params));
    res.send(`Item with code ${targetCode} has been deleted.`);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};
