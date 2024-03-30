const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const storage = multer.memoryStorage();

app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });

const fileFilter = (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  };
  
  const AWS = require('aws-sdk');
  const s3 = new AWS.S3({
    accessKeyId: 'myId',
    secretAccessKey: 'myKey'
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: fileFilter
  });


  app.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;
  
    const params = {
      Bucket: 'lab-test-hatic',
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype
    };
  
    try {
      await s3.upload(params).promise();
      res.status(200).send('File uploaded to S3 successfully!');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error uploading file to S3');
    }
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
  app.get('/info', (req, res) => {
    res.status(200).send('time: ' + Date.now());
  });
  app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      res.status(400).send('Error uploading file: ' + error.message);
    } else if (error) {
      res.status(400).send('Error: ' + error.message);
    } else {
      next();
    }
  });

  console.log("Hellooo");
  