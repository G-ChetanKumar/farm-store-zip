const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload file to S3
const uploadFileToS3 = async (file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: Date.now().toString() + "-" + file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    return { url: s3Url, key: params.Key };
  } catch (error) {
    throw new Error("S3 Upload Error: " + error.message);
  }
};

// Delete file from S3
const deleteFileFromS3 = async (key) => {
  const params = { Bucket: process.env.AWS_BUCKET_NAME, Key: key };

  try {
    const command = new DeleteObjectCommand(params);
    await s3.send(command);
  } catch (error) {
    throw new Error("S3 Delete Error: " + error.message);
  }
};

// Export functions for use in other modules
module.exports = {
  uploadFileToS3,
  deleteFileFromS3,
};
