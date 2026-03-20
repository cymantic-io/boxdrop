#!/usr/bin/env python3

import json
import mimetypes
import os
import pathlib
import sys


try:
    import boto3
    from botocore.client import Config
    from botocore.exceptions import ClientError
except ImportError as exc:
    print("boto3 is required. Install it with: python3 -m pip install boto3", file=sys.stderr)
    raise SystemExit(1) from exc


ROOT = pathlib.Path(__file__).resolve().parent
MANIFEST_PATH = ROOT / "seed_image_manifest.json"
IMAGE_DIR = ROOT / "seed-images"


def ensure_bucket(s3, bucket: str) -> None:
    try:
        s3.head_bucket(Bucket=bucket)
    except ClientError:
        s3.create_bucket(Bucket=bucket)


def make_bucket_public(s3, bucket: str) -> None:
    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": ["s3:GetObject"],
                "Resource": [f"arn:aws:s3:::{bucket}/*"],
            }
        ],
    }
    s3.put_bucket_policy(Bucket=bucket, Policy=json.dumps(policy))


def main() -> int:
    endpoint = os.environ.get("S3_ENDPOINT", "http://localhost:9000")
    access_key = os.environ.get("S3_ACCESS_KEY", "minioadmin")
    secret_key = os.environ.get("S3_SECRET_KEY", "minioadmin")
    bucket = os.environ.get("S3_BUCKET", "boxdrop-images")
    region = os.environ.get("S3_REGION", "us-east-1")

    manifest = json.loads(MANIFEST_PATH.read_text())
    s3 = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=region,
        config=Config(signature_version="s3v4"),
    )

    ensure_bucket(s3, bucket)
    make_bucket_public(s3, bucket)

    for item in manifest:
        local_path = IMAGE_DIR / item["localFilename"]
        if not local_path.exists():
            print(f"Missing local file: {local_path}", file=sys.stderr)
            return 1
        content_type = mimetypes.guess_type(local_path.name)[0] or "application/octet-stream"
        print(f"Uploading {local_path.name} -> s3://{bucket}/{item['seedKey']}")
        with local_path.open("rb") as handle:
            s3.upload_fileobj(
                handle,
                bucket,
                item["seedKey"],
                ExtraArgs={"ContentType": content_type},
            )

    print(f"Uploaded {len(manifest)} files to {endpoint}/{bucket}/seed/listings/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
