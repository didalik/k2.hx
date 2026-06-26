.ONESHELL: # {{{1
DEFAULT_RULE = rule 2
DEMO_USERS ?= Abe Al Ava Aza
SHELL = /usr/bin/bash
SRC = src/${.DEFAULT_GOAL}
VAULT = ${.DEFAULT_GOAL}/vault

ifeq (${TM},skip)
DEMO_USERS := Abe
endif

define dmock # {{{1
	demo() { # {{{2
		for actor in Ann Bob Cyn; do
		  run_demo &
		  echo -n "$$! "
	  done
		wait
	}
	run_demo() { # {{{2
	  sleep 0.1
		echo "$$actor started demo for $$demouser"
	  declare r=$$RANDOM
		declare s=$$(( (r % 5) + 1 ))
	  sleep $$s
		echo "+$$s $$actor demo DONE for $$demouser"
	} # }}}2
	demo
endef

define request_demo # {{{1
  echo "$$$$ $@ running request_demo..."
endef

define request_dmock # {{{1
	request_dmock() { # {{{2
	  sleep 0.01
		echo "$$demouser requested demo..."
		while :; do mkdir lock 2>/dev/null && break; sleep 2; done
		$(call dmock)
		rm -rf lock
	} # }}}2
	request_dmock &
endef

define reset_tm # {{{1
  echo "$$$$ $@ running reset_tm..."
endef

define testplan # {{{1
(sleep $$(( (RANDOM % 5) + 1 ));echo $$$$ $$demouser)
endef

.PHONY: demoit # rule 2 {{{1
demoit: tmit
	@echo "${.DEFAULT_GOAL} (${DEFAULT_RULE}) started on $$(date)"
	for demouser in Abe Al Ava
	do
	  export demouser VAULT=${VAULT}
	  npx ava ${SRC}/demoit.js &
		echo $$! > ${VAULT}/$$demouser.pid
		while [ ! -e $$VAULT/demo.granted ]; do sleep 1; done
		rm $$VAULT/demo.granted
		sleep 5 # TODO $(call abc)
		echo "demouser $$demouser DONE on $$(date)"
	done
	wait
	#kill $$(cat ${VAULT}/tm.pid)

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
	export VAULT=${VAULT}
	mkdir -p $$VAULT
	rm -f $$VAULT/{tm.up,demo.granted,*.pid,Ann.keys}
	npx ava ${SRC}/tmit.js &
	echo $$! > $$VAULT/tm.pid
	while [ ! -e $$VAULT/tm.up ]; do sleep 1; done

.PHONY: dg2b # TODO default-goal-to-be: demoit {{{1
dg2b:
	@uname -a
	echo -e "\n$$$$ $@ started on $$(date)"
ifeq (${TM},skip)
	echo "$$$$ $@ skipping reset_tm..."
else
ifeq (${TM},mock)
	echo "$$$$ $@ skipping reset_tm..."
else
	$(call reset_tm)
endif
endif
	for demouser in ${DEMO_USERS}; do
ifeq (${DEMO},mock)
	  $(call request_dmock)
		echo -n "$$! "
else
	  $(call request_demo)
endif
	done
	wait
	echo $$$$ $@ DONE on $$(date)

