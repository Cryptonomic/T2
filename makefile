run-container:
	echo "Create docker image, run container"
	sudo docker build . -t ${imageName}
	sudo docker run -i -t ${imageName} /bin/bash

start-container:
	docker start ${containerId}

stop-container:
	docker stop ${containerId}

dive-container:
	docker exec -it ${containerId} bash

jenkins-start:
	docker exec -it ${containerId} bash -c "service start jenkins"

copy-assets:
	echo "Copy assets folder into container"
	docker cp assets/. ${containerId}:T2/assets

copy-config:
	echo "Copy config folder into container"
	docker cp config/. ${containerId}:T2/config

build-local:
	echo "Build source from local machine"
	docker cp src/. ${containerId}:T2/
	docker cp test/. ${containerId}:T2/
	docker cp package.json ${containerId}:T2/
	docker cp tsconfig.json ${containerId}:T2/
	docker cp tslint.json ${containerId}:T2/
	docker cp webpack.base.config.js ${containerId}:T2/
	docker cp webpack.main.config.js ${containerId}:T2/
	docker cp webpack.main.prod.config.js ${containerId}:T2/
	docker cp webpack.renderer.config.js ${containerId}:T2/
	docker cp webpack.renderer.dev.config.js ${containerId}:T2/
	docker cp webpack.renderer.prod.config.js ${containerId}:T2/
	docker exec -it ${containerId} bash -c "cd /T2 && npm install && npm run dist -- -mwl"

build-git:
	echo "Build source from git"
	docker exec -it ${containerId} bash \
		-c "cd /T2 && git checkout -- . && git checkout ${branch} && git pull origin ${branch} && npm install && npm run dist -- -mwl"
