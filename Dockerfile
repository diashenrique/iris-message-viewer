ARG IMAGE=intersystemsdc/iris-community:2021.1.0.215.3-zpm
FROM $IMAGE

USER root

WORKDIR /opt/irisapp
RUN chown ${ISC_PACKAGE_MGRUSER}:${ISC_PACKAGE_IRISGROUP} /opt/irisapp
USER ${ISC_PACKAGE_MGRUSER}

COPY  Installer.cls .
COPY  src src
COPY iris.script /tmp/iris.script

RUN iris start IRIS \
  && iris session IRIS < /tmp/iris.script \
  && iris stop IRIS quietly
