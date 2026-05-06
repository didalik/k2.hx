.ONESHELL:

.PHONY: shell # {{{1
shell:
	@npx ava test/demo_tm.js &
	echo $@ pid $$! started on $$(date)
	while [ ! -e vault/Issuer.keys ]; do sleep 1; done
	npx ava test/demo_tm_request.js &
	echo $@ pid $$! started on $$(date)
	wait
