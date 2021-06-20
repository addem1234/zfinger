import boto3

BUCKET = 'zfinger'

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
        ContentType=mimetype
        Metadata={
            'Cache-Control': 'max-age=604800'
        }
    )

def delete(path):
    bucket.Object(path).delete()
