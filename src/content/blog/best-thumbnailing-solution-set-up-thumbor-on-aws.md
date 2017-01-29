---
title: "Best Thumbnailing Solution - Set up Thumbor on AWS"
subtitle: "[Updated 5/26/15] How to set up a Thumbor image server on Amazon Web Services"
date: 2014-04-20
category: "code"
tags:
  - Amazon Web Services
  - S3
  - EC2
  - Thumbor
  - Scaleability
  - Nginx
  - Supervisord
  - Load Balance
  - CloudFront
  - Thumbnail
  - Upload
  - pngcrush
  - jpegtran
  - gifsicle
  - Image Optimization
layout: blog-post.hbs
---

**UPDATED May 26th, 2015**

How to set up a Thumbor image server on Amazon Web Services

### Problem

Just about every web or internet based application needs the ability to upload images and present them back to it's users in a meaningful/efficient way. In order to do that, more often than not, we need the ability to dynamically generate new images which are better suited to our application. Maybe the original is too big, perhaps it's rotated the wrong way or we might just need a tiny square thumbnail. Whatever the case may be, we need a convenient and scaleable method to accomplish it.


There are really two main approaches to this problem. The first is to generate predefined thumbnails or images from the original as soon as the original is uploaded. This approach can be problematic for many reasons. It's difficult to scale and a nightmare to maintain. It wastes unnecessary disk space with unused images that will never be used. Adding new image sizes requires generating huge numbers of new images which takes time and power. And in general, it's just very inflexible and inconvenient for everyone. The second and better approach is to dynamically generate our images on the fly. This method is not without it's pitfalls however and comes down to proper execution. We need three main things:

* **Speed/Efficiency** - It needs to be fast and efficient, we don't want to be constantly regenerating the same images over and over again. We also can't have users waiting around for images to generate.
* **Security** - It has to be secure, we don't want a system that can be easily abused. i.e. we don't want people to manipulate the URL and generate whatever image size they want.
* **Scaleable** - We need our system to be able to grow with our application and not hold us back or slow us down.


### Solution

To achieve our desired result my solution splits this task among three components. The first and primary component is a Thumbor server. Thumbor is an open source imaging service that can perform on-demand crop, resizing and flipping of images. We'll run this on it's own box away from our application server. Our application server will then be able to use our Thumbor servers secret key to sign image urls and offload the processing.

We're going to use S3 to externally store all of our uploaded images away from Thumbor itself. We're doing this because first and foremost, it's good practice to store media files in a fault tolerant system like S3. Second of all, keeping the originals in a centralized and shared resource like S3 allows us to scale. If we're doing tons of image manipulations we can simply add more Thumbor servers to spread out processing and they'll always have access to the necessary media.

And lastly we're going to put our Thumbor server behind CloudFront so that we have a CDN to get images to our users as fast as possible. With all three of these components together we can achieve the efficiency, security and scalability we're looking for.

So let's recap with a use case example:

1. A user uploads a image to our application.
2. Our application stores that image in our S3 bucket.
3. Our application then receives a page request that needs that image cropped and resized.
4. Our application uses our Thumbor secret key to generate a cropped and resized image url.
5. On page load the browser requests that generated url from our Thumbor server.
6. The Thumbor server checks it's cache and realizes it does not have the requested thumbnail generated yet.
7. Thumbor then loads the original image from S3 and performs the desired manipulations and returns the resulting image

The next time around the image will be cached and won't need to generate, furthermore once we add Thumbor as an origin in CloudFront, our Thumbor server won't even see the request and CloudFront will deliver the cache. This might all see a little complicated at first but it's actually super simple once it's all up and running.


### Setup

#### Server Setup

Alright so lets get started. Setup your new EC2 instance, choose the 64-bit version of the Amazon Linux AMI. Getting this setup is pretty simple and if you've never done it before their are great resources on how to do it all over the internet. While you're in the AWS console you might as well go ahead and setup S3 with the bucket you want to use to store your images. It's also a good idea to setup a read-only user account with AWS IAM. We'll use this user account to access the images from the Thumbor server. When you create this user make sure you keep the `Access Key ID` and the `Secret Access Key` for that user, we're going to need them later.


Once you have your new instance up and running, switch to the root user and update yum.

```bash
sudo su
yum update -y
```

Next let's get Nginx installed. We're going to use Nginx to proxy and round robin load balance image requests to our internal Thumbor processes.

```bash
yum install nginx.x86_64 -y
/etc/init.d/nginx start
```

Check your Amazon url to make sure you see the default Nginx page. Once you know the install went smooth, run the following command to ensure Nginx runs on start up.

```bash
/sbin/chkconfig nginx on

```


#### Thumbor

Now we need to get Thumbor installed and to do that we need to make sure we have a few dependencies installed first.

We'll need Python, Git, GCC and a couple other things to run and compile Thumbor and it's dependencies.

```bash
yum install python-devel gcc autoconf.noarch automake git -y
```

Thumbor needs a few libraries/dependencies installed on the system.

```bash
yum install libjpeg-turbo-devel.x86_64 libjpeg-turbo-utils.x86_64 libtiff-devel.x86_64 libpng-devel.x86_64 pngcrush jasper-devel.x86_64 libwebp-devel.x86_64 python-pip -y
pip install pycurl
pip install numpy
```

Thumbor has compression functionality added by `jpegtran`, `pngcrush` and `gifsicle`. The above commands installed `jpegtran` and `pngcrush` but we need to get `gifsicle` manually from [GitHub](https://github.com/kohler/gifsicle).


```bash
git clone https://github.com/kohler/gifsicle.git
cd gifsicle
./bootstrap.sh
./configure
make
make install
cd ../
rm -rf gifsicle/
```

Once we have all that installed, we're ready for Thumbor. (Thumbor version 5.x.x isn't yet supported by the s3 loader, I'll update as soon as it's available)

```bash
pip install thumbor==4.12.2

```

Now let's add a service plugin to Thumbor that will allow us to use S3 as our image loader.

```bash
git clone https://github.com/willtrking/thumbor_aws.git
cd thumbor_aws/
python setup.py install
cd ../
rm -rf thumbor_aws/

```

We'll need to add two additional optimizer plugins as well. Thumbor already includes a script to support `jpegtran` but we'll need to add our own to support `pngcrush` and `gifsicle`.

For `pngcrush`, run the command:

```bash
nano /usr/local/lib64/python2.7/site-packages/thumbor/optimizers/pngcrush.py
```

And paste the following:

```python
#!/usr/bin/python
# -*- coding: utf-8 -*-

# thumbor imaging service
# https://github.com/thumbor/thumbor/wiki

# Licensed under the MIT license:
# http://www.opensource.org/licenses/mit-license


import os
import subprocess

from thumbor.optimizers import BaseOptimizer
from thumbor.utils import logger


class Optimizer(BaseOptimizer):
    def __init__(self, context):
        super(Optimizer, self).__init__(context)

        self.runnable = True
        self.pngcrush_path = self.context.config.PNGCRUSH_PATH
        if not (os.path.isfile(self.pngcrush_path) and os.access(self.pngcrush_path, os.X_OK)):
            logger.error("ERROR pngcrush path '{0}' is not accessible".format(self.pngcrush_path))
            self.runnable = False

    def should_run(self, image_extension, buffer):
        return 'png' in image_extension and self.runnable

    def optimize(self, buffer, input_file, output_file):
        command = '%s -reduce -q %s %s ' % (
            self.pngcrush_path,
            input_file,
            output_file,
        )
        with open(os.devnull) as null:
            subprocess.call(command, shell=True, stdin=null)
```

For `gifsicle`, run the command:

```bash
nano /usr/local/lib64/python2.7/site-packages/thumbor/optimizers/gifsicle.py
```

And paste the following:

```python
#!/usr/bin/python
# -*- coding: utf-8 -*-

# thumbor imaging service
# https://github.com/globocom/thumbor/wiki

# Licensed under the MIT license:
# http://www.opensource.org/licenses/mit-license
# Copyright (c) 2011 globo.com timehome@corp.globo.com

import os

from thumbor.optimizers import BaseOptimizer

class Optimizer(BaseOptimizer):

    def should_run(self, image_extension, buffer):
        return 'gif' in image_extension

    def optimize(self, buffer, input_file, output_file):
        gifsicle_path = self.context.config.GIFSICLE_PATH
        command = '%s --optimize --output %s %s ' % (
            gifsicle_path,
            output_file,
            input_file,
        )
        os.system(command)
```

Now that Thumbor is installed, we need to setup our config. Run the following command to get the default config file added

```bash
/usr/local/bin/thumbor-config > /etc/thumbor.conf

```

We'll need to make a few changes.

First change the following line:

```ini
#LOADER = 'thumbor.loaders.http_loader'
```

to

```ini
LOADER = 'thumbor_aws.loaders.s3_loader'
```

For testing you can leave the next few lines alone but in production you'll definitely want to change them.

```ini
#SECURITY_KEY = 'MY_SECURE_KEY'
#ALLOW_UNSAFE_URL = True
#ALLOW_OLD_URLS = True
```

```ini
SECURITY_KEY = 'UJwHAZLsRejTyLI88lAriHL7xAXa6q0umiwwpPcP'
ALLOW_UNSAFE_URL = False
ALLOW_OLD_URLS = False
```

The key you'll want to randomly generate, this [generator](http://www.sethcardoza.com/tools/random-password-generator/) works great. The security key is used to sign the image urls so that they can't be tampered with by malicious users (the one above is an example and you should use your own).

You'll also probably want to change respect orientation from false to true in order for Thumbor to respect the exif data of jpeg images

```
RESPECT_ORIENTATION = True
```

Earlier I mentioned Thumbor having the ability to optimize images, we'll want to turn that on by modifying the `Optimizers` section of the config as follows.

```ini
################################## Optimizers ##################################

## List of optimizers that thumbor will use to optimize images
## Defaults to: []
OPTIMIZERS = [
    'thumbor.optimizers.jpegtran',
    'thumbor.optimizers.gifsicle',
    'thumbor.optimizers.pngcrush',
]

JPEGTRAN_PATH = '/usr/bin/jpegtran'
GIFSICLE_PATH = '/usr/local/bin/gifsicle'
PNGCRUSH_PATH = '/usr/bin/pngcrush'

################################################################################
```

We also need to add some S3 config variables so that our loader knows how to connect to our bucket. Use the keys you saved earlier when you created your IAM read-only user. (This section doesn't exist in the default config and you'll need to add it somewhere).


```ini
################# Thumbor AWS ###################
## Configuration for AWS
## https://github.com/willtrking/thumbor_aws.git

AWS_ACCESS_KEY   = '<INSER READ-ONLY USER ACCESS KEY>'
AWS_SECRET_KEY   = '<INSER READ-ONLY USER SECRET KEY>'
S3_LOADER_BUCKET = '<INSERT BUCKET NAME>'

# The following keys aren't needed
STORAGE_BUCKET = ''
RESULT_STORAGE_BUCKET = ''

#################################
```

Now that we have our Thumbor server configured, we need to make sure it runs automatically when our server reboots. To do that we'll need to install supervisor.

```bash
easy_install supervisor
```

Then paste the following into a file titled `supervisord`.

```bash
#! /bin/sh
### BEGIN INIT INFO
# Provides:          supervisord
# Required-Start:    $remote_fs
# Required-Stop:     $remote_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Supervisor init script
# Description:       Supervisor init script
### END INIT INFO

# Supervisord auto-start
#
# description: Auto-starts supervisord
# processname: supervisord
# pidfile: /var/run/supervisord.pid

SUPERVISORD=/usr/local/bin/supervisord
SUPERVISORCTL=/usr/local/bin/supervisorctl
ARGS="-c /etc/supervisord.conf"

case $1 in
start)
        echo -n "Starting supervisord: "
        $SUPERVISORD $ARGS
        echo
        ;;
stop)
        echo -n "Stopping supervisord: "
        $SUPERVISORCTL shutdown
        echo
        ;;
restart)
        echo -n "Stopping supervisord: "
        $SUPERVISORCTL shutdown
        echo
        echo -n "Starting supervisord: "
        $SUPERVISORD $ARGS
        echo
        ;;
esac
```

Save that and run the following commands to move it to the `init.d` folder and to make it executable on startup.

```bash
chmod +x supervisord
mv supervisord /etc/init.d/supervisord
chkconfig --add supervisord

```

Now that we have supervisor installed, we need to add the config file that's going to tell supervisor how to start up our Thumbor processes. Save the the following in `/etc/supervisord.conf`

```ini
[unix_http_server]
file=/tmp/supervisor.sock   ; (the path to the socket file)

[supervisord]
logfile=/tmp/supervisord.log ; (main log file;default $CWD/supervisord.log)
logfile_maxbytes=50MB        ; (max main logfile bytes b4 rotation;default 50MB)
logfile_backups=10           ; (num of main logfile rotation backups;default 10)
loglevel=info                ; (log level;default info; others: debug,warn,trace)
pidfile=/tmp/supervisord.pid ; (supervisord pidfile;default supervisord.pid)
nodaemon=false               ; (start in foreground if true;default false)
minfds=1024                  ; (min. avail startup file descriptors;default 1024)
minprocs=200                 ; (min. avail process descriptors;default 200)

; the below section must remain in the config file for RPC
; (supervisorctl/web interface) to work, additional interfaces may be
; added by defining them in separate rpcinterface: sections
[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface

[supervisorctl]
serverurl=unix:///tmp/supervisor.sock ; use a unix:// URL  for a unix socket

[program:thumbor]
; The following command uses a different thumbor config file for each
; processes, however we want the same setup for each so that isn't necessary
; command=thumbor --ip=127.0.0.1 --port=800%(process_num)s --conf=/etc/thumbor800%(process_num)s.conf
; Instead we'll use this command to use just the one conf file
command=/usr/local/bin/thumbor --ip=127.0.0.1 --port=800%(process_num)s --conf=/etc/thumbor.conf
process_name=thumbor800%(process_num)s
numprocs=4
autostart=true
autorestart=true
startretries=3
stopsignal=TERM
; Output logs for each of our processes
stdout_logfile=/var/log/thumbor.stdout.log
stdout_logfile_maxbytes=1MB
stdout_logfile_backups=10
stderr_logfile=/var/log/thumbor.stderr.log
stderr_logfile_maxbytes=1MB
stderr_logfile_backups=10

```

There are some comments above that give a more granular explanation of what's going on but the gist of it is that we're firing up four Thumbor processes running on port 8000, 8001, 8002 and 8003. Now that we've got supervisor and Thumbor setup let's start it up.

```bash
/etc/init.d/supervisord start
```

As I mentioned just above we have four processes running on for different ports. So we need to tell Nginx about these processes and load balance our incoming requests among them. So add the following file to `/etc/nginx/conf.d/thumbor.conf`.


```nginx
#
# A virtual host using mix of IP-, name-, and port-based configuration
#

upstream thumbor  {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
    server 127.0.0.1:8003;
}

server {
    listen       80;
    server_name  <INSERT YOUR DOMAIN NAME>;
    client_max_body_size 10M;

    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header HOST $http_host;
        proxy_set_header X-NginX-Proxy true;

        proxy_pass http://thumbor;
        proxy_redirect off;
    }
}

```

Once you've saved that, restart Nginx.

```bash
/etc/init.d/nginx restart
```

Our Thumbor server should be alive and kicking now! To test it, navigate to: `http://THUMBOR-DOMAIN/healthcheck` and you should see the word `WORKING!`. If you left the Thumbor config variable `ALLOW_UNSAFE_URL` set to true you should be able to resize any images you have saved in your bucket by simply using the following (or similar) format i.e. `http://THUMBOR-DOMAIN/unsafe/300x200/<S3-IMAGE-PATH.jpg>`. When you're ready for production [here](https://github.com/99designs/phumbor) is a full list of libraries you can use to generate signed urls in the programming language of your choice.


#### CloudFront

CloudFront isn't absolutely necessary but it rounds out this solution. I'm not going to go through the full setup because there are plenty of resources out there to walk you through it. Basically what you want to do is create a CloudFront origin that points to your Thumbor server domain. So basically your Thumbor urls change from being

`http://your-domain.com/unsafe/1280x440/filters:fill(green)/some-image.jpg`

to

`http://abc123.cloudfront.net/unsafe/1280x440/filters:fill(green)/some-image.jpg`

It's super simple and it takes the load off your Thumbor server. That way your Thumber server get's pinged only once per TTL per image.

----

And that's it! If you have any comments/suggestions or improvements to my solution feel free to leave a comment below.
