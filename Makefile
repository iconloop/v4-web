FRONTEND_IMAGE=spcy-v4-web:dev

help:
	@echo 'make run'

run:
	docker run --rm -p 80:80 $(FRONTEND_IMAGE)

base-image-build:
	docker build . -t spcy-v4-web-base:dev

base-image-build-prod:
	docker build . -t spcy-v4-web-base:prod --build-arg MODE=production

nginx-image-build:
	docker build nginx -t $(FRONTEND_IMAGE)
