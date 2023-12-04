# Dockerfile.directus
FROM directus/directus:10.8.2

# No additional steps are needed unless you want to customize the Directus image.
COPY favicon.ico /favicon.ico

WORKDIR /directus
USER root

# Avoid seeing constant log warnings about missing favicon.ico file
COPY favicon.ico /favicon.ico

# Install local dependencies
RUN npm i -g pnpm

# SETUP PYTHON (required by some extensions)
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
RUN apk add --update build-base

# UNCOMMENT OUT THE SECTION BELOW IF YOU WANT TO INSTALL EXTENSIONS ON EACH BUILD, VS PERSISTING THE EXTENSION FOLDER
# RUN pnpm i @directus/sdk
# RUN pnpm i directus-extension-field-actions
# RUN pnpm i directus-extension-group-modal-interface
# RUN pnpm i directus-extension-sanitize-html
# RUN pnpm i directus-extension-sparkline-display
# RUN pnpm i directus-extension-tags-m2m-interface
# RUN pnpm i directus-extension-sql-panel

# JUST FOR MY OWN CONVENIENCE WHEN I SSH INTO THE CONTAINER
RUN alias ll='ls -altr'
