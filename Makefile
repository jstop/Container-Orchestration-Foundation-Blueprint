#!/bin/bash
CDK_PATH  := $(CURDIR)/blueprint
APP_PATH  := $(CURDIR)/apps
ARGO_PASSWD  :=`kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`

# Dependecies
HOMEBREW_LIBS :=  nvm typescript argocd git-remote-codecommit

all: bootstrap build
	
build:
	make deploy
	aws eks update-kubeconfig --name blueprint --region us-east-2 
	./scripts/karpenter_provisioner.sh
	cd $(APP_PATH)/spring-frontend && git init && git add . && git commit -m 'inital commit' && git remote add origin codecommit::us-east-2://spring-frontend && git push --set-upstream origin main
	cd $(APP_PATH)/spring-backend && git init && git add . && git commit -am 'inital commit' && git remote add origin codecommit::us-east-2://spring-backend && git push --set-upstream origin main

argo-proxy:
	echo "argo admin password: "$(ARGO_PASSWD)
	kubectl port-forward service/blueprints-addon-argocd-server -n argocd 8080:443
	
deploy:
	cd $(CDK_PATH) && cdk deploy --all 

destroy:
	eksctl delete iamserviceaccount --config-file=./tmp/service_account.yaml --approve 
	cd $(CDK_PATH) && cdk destroy --all 

dashboard:
	./scripts/k8_dashbard.sh
apps:
	./scripts/springapp.sh

bootstrap:
	@for LIB in $(HOMEBREW_LIBS) ; do \
		LIB=$$LIB make check-lib ; \
    done
	cd $(CDK_PATH) && npm install

check-lib:
ifeq ($(shell brew ls --versions $(LIB)),)
	@echo Installing $(LIB) via Hombrew
	@brew install $(LIB)
else
	@echo $(LIB) is already installed, skipping.
endif
