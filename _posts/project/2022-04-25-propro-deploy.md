---
title: "AWS EC2 Nginx 배포"
layout: single
categories: 프로젝트
tags: [ProPro, 배포]
excerpt: 엘리스 SW 엔지니어 트랙 1기 과정 중 진행했던 1차 프로젝트 Pro-Pro입니다. 진행했을 당시에는 엘리스 측에서 서버를 제공해주었는데 트랙이 끝난 이후에도 프로젝트를 살려두고 싶은 마음이 있어서 팀원들과 함께 다시 배포하게 됬습니다. 마침 제가 AWS 프리티어 기간이 남아, 직접 해보며 공부해볼 좋은 기회가 생겼습니다.
thumbnail: /assets/images/project/pro-pro.jpeg
header:
  overlay_image: /assets/images/project/pro-pro.jpeg
  overlay_filter: 0.5 
toc: true
toc_sticky: true
---
> [pro-pro](https://propro.kr/)

## 서론

엘리스 SW 엔지니어 트랙 1기 과정 중 진행했던 1차 프로젝트 Pro-Pro입니다. 진행했을 당시에는 엘리스 측에서 서버를 제공해주었는데 트랙이 끝난 이후에도 프로젝트를 살려두고 싶은 마음이 있어서 팀원들과 함께 다시 배포하게 됬습니다. 마침 제가 AWS 프리티어 기간이 남아, 직접 해보며 공부해볼 좋은 기회가 생겼습니다.

### 배포환경 및 프로그램

1. AWS EC2 (아마존 리눅스)
2. Nginx
3. pm2

## AWS

AWS EC2는 아마존에서 제공하는 클라우드 서비스 입니다. 쉽게 이해하면 시간당 요금을 지불하고, 아마존에 있는 컴퓨터를 빌려 쓸 수 있는 것 입니다. 처음 계정을 가입하면 12개월간 무료로 대여할 수 있는 프리티어기간이 있어 많이들 사용해보곤 합니다.

즉 이제부터 이 가상의 컴퓨터에서 저희가 만든 프로그램을 24시간동안 켜놓을겁니다. nginx가 http 요청을 받아 응답하는 웹서버 역할을 할 것이고, pm2는 실행중인 서버가 끊기지 않도록 자동으로 재실행하는 역할을 해줍니다.

### AWS에서 해야할 것

1. 계정 가입 및 지역 선택
2. 인스턴스 생성
    - 운영체제는 아마존 리눅스를 골랐습니다.
3. 키페어 보관
    - 추후 SSH 연결등을 할때 필요합니다. 재발급이 안되므로 보관에 유의합시다.
4. 인바운드 규칙 편집
    - 특정 포트번호에 대해 접근할수 있도록 열어줍니다. 저는 각각 프론트, 백 요청 그리고 https 통신을 위해 총 3개 열어주었습니다.
    
    ![스크린샷 2022-04-25 오후 1.44.09.png](/assets/images/project/propro_2.png)
    
    ![스크린샷 2022-04-25 오후 1.44.34.png](/assets/images/project/propro_3.png)
    

여기까지 왔다면 인스턴스에 우클릭해서 연결할 수 있습니다. 본인 터미널에서 진행하는 SSH 연결, 혹은 웹에서 직접 연결하는 방식을 택합시다.

![스크린샷 2022-04-25 오후 1.39.17.png](/assets/images/project/propro_1.png)

## Nginx, pm2 설치 및 실행

인스턴스 터미널에 연결했다면, 아래의 명령어들을 통해 필요한 프로그램들을 설치하고 실행시켜줍니다.여기까지 진행이 끝나면, IP주소로 들어갔을때 nginx 기본화면이 나오는걸 확인하실 수 있습니다. 혹여 에러가 난다면 AWS에서 포트를 열었는지 다시 한번 확인해주세요.

1. nvm 설치 및 활성화
    - `$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash`
    - `$ . ~/.nvm/nvm.sh`
2. 노드 및 pm2 설치
    - `$ nvm install node`
    - `$ npm install -g npm@7.14.0`
    - `$ npm install pm2 -g`
    - `pm2 start npm — start`
        - 이후 배포할 프로그램을 설치한뒤 백엔드 폴더에서 실행하면 됩니다.
3. nginx 설치 및 시작
    - `sudo amazon-linux-extras install -y nginx1`
    - `sudo service nginx start`
    - 이후 접속 가능한 주소 : `<IPv4 퍼블릭 IP>`

## 배포할 파일 세팅

인스턴스 주소에 접속했을때 직접 만든 프로그램을 화면에 뛰우도록 하는 과정입니다. 개인적으로 nginx가 어느 경로를 참조해서 응답을 하는지 알아내기 어려웠습니다. 이는 기본설정파일인 `/etc/nginx/nginx.conf` 에서 확인할 수 있습니다.

![스크린샷 2022-04-25 오후 2.03.48.png](/assets/images/project/propro_4.png)

밑줄친 경로에 있는 모든 설정파일들을 불러오고 있는 게 확인되니, 해당 경로안에서 필요한 설정 파일을 만들어주었습니다.

1. nginx(12.0.0) 환경설정
    - `cd /etc/nginx/conf.d`
    - `sudo touch propro.conf`
    - `sudo vim propro.conf`
        
        ```
        server {
          listen 80;
          location /api/ {
            proxy_pass http://127.0.0.1:4000/;
          }
          location / {
            root   /home/ec2-user/{project}/frontend/dist;
            index  index.html index.htm;
            try_files $uri /index.html;
          }
        }
        ```
        
2. 배포할 프로그램 설치
    - `cd /home/ec2-user`
    - `git clone https://github.com/{project}`
    - `cd {project}`
    - `cd backend`
        - `npm i`
        - `sudo touch .env`
        - `sudo vim .env`
            - 기존 env 파일을 작성해주시고, 서버환경으로 바뀜에 따라 변경되야 하는 값이 있는지 확인해주면서 진행해야 합니다.
        - `pm2 start npm — start`
    - `cd frontend`
        - `npm i`
        - `sudo touch .env`
        - `sudo vim .env`
            - 마찬가지로 변경되야하는 값이 있는지 확인합니다.
        - `npm run build`

### 발생했던 에러

1. 빌드파일 참조에러
    - 배포할 프로그램 세팅 이후 500 Internal Server Error가 발생했었습니다. 이는 nginx 설정파일은 인식이 되고 있지만 무언가 잘못됬다는 의미로 해석됬습니다. 혹시나하는 마음에 참조하는 경로 중간마다 `chmod`를 통해 권한을 부여해주니 해결되었습니다.
2. proxy_pass prefix 문제
    - reverse proxy를 이용해 /api/ 주소로 요청이 들어오면, 백엔드로 요청을 넘겨주었습니다. 이때 prefix로 /api/가 그대로 붙게되어, 기존 백엔드 코드의 요청경로를 모두 변경해야할 위기에 처했습니다만, 다행히도 proxy_pass 주소 끝에 /를 추가해주니 prefix가 붙지 않게 됬습니다.
        
        `proxy_pass http://127.0.0.1:4000` ⇒ `proxy_pass http://127.0.0.1:4000/`
        
        ```
        server {
        listen 80;
        location /api/ {
            proxy_pass http://127.0.0.1:4000/;
        }
        location / {
            root   /home/ec2-user/{project}/frontend/dist;
            index  index.html index.htm;
            try_files $uri /index.html;
        }
        }
        ```