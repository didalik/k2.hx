.ONESHELL:
DEFAULT_RULE = rule 2
SHELL = /usr/bin/bash
VAULT = ${.DEFAULT_GOAL}/vault

.PHONY: demoit # rule 2 {{{1
demoit: tmit
	@echo "${.DEFAULT_GOAL} (${DEFAULT_RULE}) started on $$(date)"
	kill $$(cat ${VAULT}/Issuer.pid)

.PHONY: demo # rule 1{{{1
demo:
	@mkdir -p vault
	echo $@ started on $$(date) | tee vault/Issuer.in
	npx ava test/demo/Issuer.js &
	echo $@ pid $$! started on $$(date) for Issuer
	while [ ! -e vault/Issuer.keys ]; do sleep 1; done
	for actor in Ann Bob Cyn
	do
	  npx ava test/demo/$$actor.js &
	  echo $@ pid $$! started on $$(date) for $$actor
	done
	wait

.PHONY: it # rule 0 {{{1
it:
	@npx ava it/demo_tm.js &
	echo $@ pid $$! started on $$(date)
	while [ ! -e vault/Issuer.keys ]; do sleep 1; done
	for demouser in Abe # Al Ava
	do
	  export demouser
	  npx ava it/demo_tm_request.js &
	  echo $@ pid $$! started on $$(date)
	done
	wait

.PHONY: clear # {{{1
clear:
	@rm -rf vault

.PHONY: fund # {{{1
fund:
	@for actor in Ann Bob Cyn; do rm vault/$$actor.fund.HEXA; done
	rm -f vault/Issuer.desc.*

.PHONY: tmit # {{{1
tmit:
	@echo $@ started on $$(date)
	export VAULT=${VAULT}; mkdir -p $$VAULT
	npx ava src/${.DEFAULT_GOAL}/tmit.js &
	echo $$! > $$VAULT/Issuer.pid
	while [ ! -e $$VAULT/Issuer.keys ]; do sleep 1; done

