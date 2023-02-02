#!/bin/bash

# Libraries
TSC := node node_modules/.bin/tsc --skipLibCheck
ESLINT := node node_modules/.bin/eslint
CDK := node node_modules/.bin/cdk
CDK_PATH := ./cdk/blueprint

# Dependecies
HOMEBREW_LIBS :=  nvm typescript argocd

all:
	$(MAKE) -C ./cdk

npm_install:
	npm install $(CDK_PATH)

deps: bootstrap
	npm install $(CDK_PATH)

lint: 
	$(ESLINT) . --ext .js,.jsx,.ts,.tsx

build:
	rm -rf dist && $(TSC)

list: 
	$(CDK) list

mkdocs:
	mkdocs serve 

synth: 
	$(CDK) synth	

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
