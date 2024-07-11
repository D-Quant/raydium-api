.PHONY: build prod cleanup


## 编译
build:
	docker build -t raydium-api .

## 启动
start:
	echo 'docker run -e WALLET_SECRET_KEY=your_wallet_secret_key_here -e ENDPOINT_URL=https://your_rpc_url_here -p 3000:8000 raydium-api'

cleanup:
	chmod +x cleanup.sh
	sh cleanup.sh

## Show help
help:
	@echo ''
	@echo 'Usage:'
	@echo ' make target'
	@echo ''
	@echo 'Targets:'
	@awk '/^[a-zA-Z\-\_0-9]+:/ { \
	helpMessage = match(lastLine, /^## (.*)/); \
	if (helpMessage) { \
	helpCommand = substr($$1, 0, index($$1, ":")-1); \
	helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
	printf " %-20s %s\n", helpCommand, helpMessage; \
	} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)
