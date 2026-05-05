.ONESHELL:

.PHONY: shell # {{{1
shell:
	@npx ava test/demo_tm.js &
	echo $@ pid $$! started on $$(date)
	npx ava test/demo_tm_request.js &
	echo $@ pid $$! started on $$(date)
	npx ava test/demo_tm_request.js &
	echo $@ pid $$! started on $$(date)
	npx ava test/demo_tm_request.js &
	echo $@ pid $$! started on $$(date)
	wait
