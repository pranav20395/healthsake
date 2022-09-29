---
This milestone is worth 2.5% of weightage. The 25 marks of this deadline will be scaled accordlingly.

[X]  Decide the full tech stack, including OS, web server, and database (a rough idea).
[X]  Install and configure the web server along with SSL/TLS certificates.
[X]  Host any sample HTTPS website on the VM provided.  

[ ] One member of each team is required to submit a report having screenshots for each of the steps required for the setup, showing all the commands executed and their outcomes.  
  
[ ] Submission filename example: Team0_September.pdf
---

# September Milestone Report
#### Group 7
- Jaideep Guntupalli(2020378)
- Cyrus Monteiro(2020368)
- Ayush Singhal(2020365)
- Pranav Sharma(2020395)

## Tech Stack
### OS
**Linux**(Ubuntu) is being used as an operating system in the virtual machine.

### Web Server
**Nginx** will be used as web server to host the website in the alloted virtual machine.

### Language
**Javascript / Typescript** will be used as a primary language through out the project.

### Frontend Frameworks
**ReactJS** will be used as a primary frontend framework, combined with **TailwindCSS** for styling the frontend.

### Backend Technologies
We are planning to use **NestJS**, an opinionated backend framework based on NodeJS with **Prisma** as an ORM to easily communicate with the database.

### Database
We are planning to use **PostgreSQL** as primary database.

## Installation Steps
1. Install nginx web server
```shell
sudo apt install nginx
```

2. Created a basic html site
```shell
mkdir site

cd site

echo "<h1>Hello World, This is Jaideep, Pranav, Ayush and Cyrus!!</h1>" >> index.html
```
This created to host the site.
<div style="page-break-after: always; visibility: hidden">
\pagebreak
</div>

3. Created a temp openssl configuration to add IP address as subject alternate name
```shell
cp /etc/ssl/openssl.cnf ~/openssl-temp.cnf

nano openssl-temp.cnf

# Changes made
[ v3_ca ]

subjectAltName = IP:192.168.2.239
```
This configuration is created to generate ssl certificate in next step.

4. Created a self-signed certificate and key pair with OpenSSL and temp configuration
```shell
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 
-config ~/openssl-temp.cnf -keyout /etc/ssl/private/fcsake-selfsign.key 
-out /etc/ssl/certs/fcsake-selfsign.crt
```
This adds the subject alternate name which is verified by browsers with the actual domain/ip address used to visit the site.
![[Screenshot 2022-09-29 at 11.59.16.png|500]]
<div style="page-break-after: always; visibility: hidden">
\pagebreak
</div>

5. Created a strong Diffie-Hellman key pair, which will be used to ensure no key will compromise even with longer sessions with clients
```shell
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
```
![[Screenshot 2022-09-27 at 19.56.15.png|500]]
6. Created a new Nginx configuration snippet in the `/etc/nginx/snippets` directory pointing to the SSL Key and Certificate
```shell
sudo nano /etc/nginx/snippets/self-signed.conf   
```
![[Screenshot 2022-09-29 at 12.05.07.png|500]]
<div style="page-break-after: always; visibility: hidden">
\pagebreak
</div>

7. Created a new Nginx configuration snippet in the `/etc/nginx/snippets` directory with Strong Encryption Settings
```shell
sudo nano /etc/nginx/snippets/ssl-params.conf
```
![[Screenshot 2022-09-27 at 20.09.45.png|500]]
8. Configuring the server block to host our site with proper ssl configuration
```shell
sudo nano /etc/nginx/sites-available/default
```

The http server block at the top accepts requests and permanently redirects to https requests so we only get https requests.

The second server block handles https requests where we mentioned to include these snippets for including the ssl certificate and strong encryption settings which we configured earlier. At last we mentioned the folder where our index.html is present. This results in nginx returning the index.html when any request is made to the server.
![[Screenshot 2022-09-28 at 13.49.21.png|500]]
<div style="page-break-after: always; visibility: hidden">
\pagebreak
</div>

9. Checking whether all syntax related to nginx is ok.
```shell
sudo nginx -t
```
![[Screenshot 2022-09-29 at 12.13.56.png|500]]
10. Since all is ok, we can restart the nginx service bring changes into effect
```shell
sudo systemctl restart nginx
```

11. Adjusted the firewall to accept NGINX Full profile to let in HTTPS traffic and ssh requests
```shell
sudo ufw allow 'Nginx Full'
sudo ufw allow 'ssh'
```
![[Screenshot 2022-09-29 at 12.17.01.png|500]]

And the [sample site](https://192.168.2.239) is hosted. We can download the CA from [here](https://drive.google.com/file/d/1QlIrhtYkcZq1O8cp9A9H2dqYS4wkOhMD/view?usp=sharing), to install it to root directory so browsers can trust the certificate and encrypt the data.

## Sample site hosted
- [192.168.2.239](https://192.168.2.239)
- Install the private CA to root by downloading from [here](https://drive.google.com/file/d/1QlIrhtYkcZq1O8cp9A9H2dqYS4wkOhMD/view?usp=sharing)