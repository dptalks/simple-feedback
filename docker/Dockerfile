FROM alpine
RUN apk add nodejs git npm sqlite
RUN /bin/busybox --install
RUN npm install nodemon -g
WORKDIR /opt
RUN git clone https://github.com/dptalks/simple-feedback.git
WORKDIR /opt/simple-feedback
RUN npm install


CMD ["/opt/simple-feedback/startup.sh"]
