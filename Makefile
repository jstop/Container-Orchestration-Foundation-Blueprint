#!/bin/bash
CDK_PATH  := $(PWD)/cdk/blueprint
CDK_PATH  := $(PWD)/app

# Dependecies
HOMEBREW_LIBS :=  nvm typescript argocd git-remote-codecommit

all: bootstrap build
	
build:
	cd $(CDK_PATH) && npm install
	cd $(CDK_PATH) && cdk deploy --all 
	aws eks update-kubeconfig --name blueprint --region us-east-2 
	./scripts/k8_dashboard.sh
	./scripts/service_account.sh
	cd $(APP_PATH)/spring-frontend && git init && git remote add origin codecommit::us-east-2://spring-frontend && git push -u origin/main main
	cd $(APP_PATH)/spring-backend && git init && git remote add origin codecommit::us-east-2://spring-backend && git push -u origin/main main

argo-proxy:
	kubectl port-forward service/blueprints-addon-argocd-server -n argocd 8080:443

destroy:
	cd $(CDK_PATH) && cdk destroy --all 

bootstrap:
	@for LIB in $(HOMEBREW_LIBS) ; do \
		LIB=$$LIB make check-lib ; \
    done

check-lib:
ifeq ($(shell brew ls --versions $(LIB)),)
	@echo Installing $(LIB) via Hombrew
	@brew install $(LIB)
else
	@echo $(LIB) is already installed, skipping.
endif
