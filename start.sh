# shellcheck disable=SC2046
# shellcheck disable=SC2086
# shellcheck disable=SC2006
sudo docker run -v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY=unix$DISPLAY -v`pwd`/src:/app/src --rm -it electron-wrapper bash
