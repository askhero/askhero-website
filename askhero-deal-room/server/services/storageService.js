import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = process.env.AWS_ACCESS_KEY_ID
  ? new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    })
  : null;

export async function uploadOfferDocument({ key, body, contentType }) {
  if (!s3 || !process.env.AWS_S3_BUCKET) {
    return { uploaded: false, key };
  }

  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType
  }));

  return { uploaded: true, key };
}
