import boto3
from os import getenv

BUCKET = getenv('S3_BUCKET', 'zfinger')

client = boto3.client('s3')
bucket = boto3.resource('s3').Bucket(BUCKET)

def exists(path):
    return any(map(lambda x: x.key == path, bucket.objects.filter(Prefix=path)))

def get(path):
    if exists(path): return bucket.Object(path).get()

def put(path, file, mimetype):
    file.seek(0)
    return bucket.put_object(
        Key=path,
        Body=file,
        ContentType=mimetype,
        # Previously thought we should set a long Cache control here. However, this caching is between zfinger and AWS, not between the clients and zfinger
        # Setting a shorter cache here to reduce data sent between zfinger and AWS. This means it can take an hour for images to update when uploading a new image
        CacheControl="max-age=3600"
    )

def delete(path):
    bucket.Object(path).delete()
