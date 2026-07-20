.ONESHELL: # {{{1
DEMO_USERS ?= Abe Al Ava Aza
SHELL = /usr/bin/bash
SRC = src/${.DEFAULT_GOAL}
VAULT = ${.DEFAULT_GOAL}/vault

ifeq (${TM},skip)
DEMO_USERS := Abe
endif

define demo # {{{1
  demo() {
		if [ ! -d $$VAULT ]; then
			mkdir -p $$VAULT
			npx ava ${SRC}/tmit.js --match 'reset test monitor'
		fi
		npx ava test/demo/Issuer.js &
		while [ ! -e $$VAULT/Issuer.keys ]; do sleep 1; done
		for actor in Ann Bob Cyn; do
			npx ava test/demo/$$actor.js &
		done
		wait
  }
	demo
endef

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
  echo "$$$$ $@ VAULT=$$VAULT; running request_demo for $$demouser..."
	$(call demo)
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
  echo "$$$$ $@ VAULT=${VAULT}; running reset_tm..."
	rm -rf $$VAULT; mkdir -p $$VAULT
	npx ava ${SRC}/tmit.js &
	echo $$! > $$VAULT/tm.pid
	while [ ! -e $$VAULT/tm.up ]; do sleep 1; done
  echo "$$$$ $@ reset_tm TM pid $$(cat $$VAULT/tm.pid)"
endef

define testplan # {{{1
(sleep $$(( (RANDOM % 5) + 1 ));echo $$$$ $$demouser)
endef

define tm_request_demo # {{{1
	request_demo() { # {{{2
		echo "$$$$ $@ VAULT=$$VAULT; running tm_request_demo for $$demouser..."
		npx ava ${SRC}/demoit.js --match='request demo' &
		while [ ! -e $$VAULT/$$demouser.granted ]; do sleep 1; done
		$(call demo)
		npx ava ${SRC}/demodone.js
		rm $$VAULT/Issuer.in
		echo "$$$$ $@ tm_request_demo for $$demouser DONE"; sleep 6
		for du in ${DEMO_USERS}; do
		  if [ ! -e $$VAULT/$$du.granted ]; then
			  echo "=== $$du.granted NOT FOUND ==="
			  return
			fi
		done
		echo '=== ALL DEMO_USERS FOUND ==='
		echo STOP > $$VAULT/tm.down
	} # }}}2
	request_demo &
endef

define tm_request_dmock # {{{1
	request_dmock() { # {{{2
		echo "$$$$ $@ VAULT=$$VAULT; running tm_request_dmock for $$demouser..."
		npx ava ${SRC}/demoit.js --match='request demo' &
		while [ ! -e $$VAULT/$$demouser.granted ]; do sleep 1; done
		$(call dmock)
		npx ava ${SRC}/demodone.js
		echo "$$$$ $@ tm_request_dmock for $$demouser DONE"
		for du in ${DEMO_USERS}; do
		  if [ ! -e $$VAULT/$$du.granted ]; then
			  echo "=== $$du.granted NOT FOUND ==="
			  return
			fi
		done
		echo '=== ALL DEMO_USERS FOUND ==='
		echo STOP > $$VAULT/tm.down
	} # }}}2
	request_dmock &
endef

.PHONY: demoit # {{{1
demoit:
	@uname -a; echo -n 'node -v '; node -v
	echo -e "\n$$$$ $@ started on $$(date)"
	  export VAULT=${VAULT}
ifeq (${TM},skip) # or, possibly, mock {{{2
	echo "$$$$ $@ skipping reset_tm..."
else
ifeq (${TM},mock)
	echo "$$$$ $@ skipping reset_tm..."
else # {{{2
	$(call reset_tm)
endif
endif # }}}2
	for demouser in ${DEMO_USERS}; do
	  export demouser
ifeq (${TM},skip) # {{{2
ifeq (${DEMO},mock)
		$(call request_dmock)
else
		$(call request_demo)
endif
		echo -n "$$! "
else # {{{2
ifeq (${TM},mock) # {{{3
ifeq (${DEMO},mock)
	  $(call request_dmock)
		echo -n "$$! "
else
	  $(call request_demo)
endif
else # {{{3
ifeq (${DEMO},mock)
	  $(call tm_request_dmock)
		echo -n "$$! "
else # {{{3
	  $(call tm_request_demo)
endif
endif # }}}3
endif # }}}2
	done
	wait
	echo $$$$ $@ DONE on $$(date)

