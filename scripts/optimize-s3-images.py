import os
import io
import json
from pathlib import Path
import boto3
from PIL import Image

def load_env(env_path):
    config = {}
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    config[k.strip()] = v.strip().strip('"').strip("'")
    return config

def main():
    root = Path(__file__).resolve().parent.parent
    server_env = load_env(root / 'server' / '.env')
    
    bucket = server_env.get('AWS_S3_BUCKET', 'sbs-store-media-748439418595')
    region = server_env.get('AWS_REGION', 'ap-south-1')
    access_key = server_env.get('AWS_ACCESS_KEY_ID')
    secret_key = server_env.get('AWS_SECRET_ACCESS_KEY')
    
    s3 = boto3.client(
        's3',
        region_name=region,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key
    )
    
    print(f"Connected to S3 bucket: {bucket} ({region})")
    
    # List images
    paginator = s3.get_paginator('list_objects_v2')
    pages = paginator.paginate(Bucket=bucket, Prefix='products/images/')
    
    total_saved_bytes = 0
    mapping = {}
    
    for page in pages:
        for item in page.get('Contents', []):
            key = item['Key']
            size = item['Size']
            
            # Skip folders or already webp
            if key.endswith('/') or key.endswith('.webp'):
                continue
                
            base_no_ext, ext = os.path.splitext(key)
            webp_key = f"{base_no_ext}.webp"
            mapping[key] = webp_key
            
            print(f"\nProcessing: {key} ({size / 1024:.1f} KB)")
            
            # Download
            obj = s3.get_object(Bucket=bucket, Key=key)
            img_bytes = obj['Body'].read()
            
            # Open & Process Image
            with Image.open(io.BytesIO(img_bytes)) as img:
                # Resize if > 1200px width/height while keeping aspect ratio
                max_dim = 1200
                if img.width > max_dim or img.height > max_dim:
                    img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
                
                # Convert color mode if needed for WebP
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    # Keep RGBA for transparent pngs
                    pass
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                out_buffer = io.BytesIO()
                img.save(out_buffer, format='WEBP', quality=82, method=6)
                webp_bytes = out_buffer.getvalue()
                webp_size = len(webp_bytes)
                
            saved = size - webp_size
            total_saved_bytes += saved
            reduction_pct = (saved / size) * 100 if size > 0 else 0
            
            print(f" -> Converted to WebP: {webp_key} ({webp_size / 1024:.1f} KB) - Reduced by {reduction_pct:.1f}%")
            
            # Upload WebP to S3 with immutable cache header
            s3.put_object(
                Bucket=bucket,
                Key=webp_key,
                Body=webp_bytes,
                ContentType='image/webp',
                CacheControl='public, max-age=31536000, immutable'
            )
            
            # Also update cache-control on original file
            s3.copy_object(
                Bucket=bucket,
                CopySource={'Bucket': bucket, 'Key': key},
                Key=key,
                ContentType=obj.get('ContentType', 'image/png'),
                CacheControl='public, max-age=31536000, immutable',
                MetadataDirective='REPLACE'
            )

    print(f"\n==========================================")
    print(f"Completed! Total bandwidth saved: {total_saved_bytes / (1024 * 1024):.2f} MB")
    print(f"Converted {len(mapping)} images to high-performance WebP.")
    print(f"==========================================")
    
    mapping_file = root / 'scripts' / 'image_key_mapping.json'
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, indent=2)
    print(f"Saved key mapping to {mapping_file}")

if __name__ == '__main__':
    main()
