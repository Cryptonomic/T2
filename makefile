copy-assets:
	echo "Copy assets folder into container"
	docker cp assets/. ${containerId}:T2/assets

copy-config:
	echo "Copy config folder into container"
	docker cp config/. ${containerId}:T2/config

build-local:
	echo "Build source from local machine"
	sudo rm -rf ./node_modules
	docker cp . ${containerId}:T2/
	docker exec -it ${containerId} bash -c "cd /T2 && npm install && npm run build"
	sudo npm install

build-git:
	echo "Build source from git"
	docker exec -it ${containerId} bash \
		-c "cd /T2 && git checkout -- . && git checkout ${branch} && git pull origin ${branch} && npm install && npm run build"