copy-assets:
	echo "Copy assets folder into container"
	docker cp assets/. ${containerId}:T2/assets

copy-config:
	echo "Copy config folder into container"
	docker cp config/. ${containerId}:T2/config