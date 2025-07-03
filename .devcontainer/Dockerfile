FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# Install system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        python3 \
        python3-pip \
        python3-dev \
        nodejs \
        npm \
        git \
        curl \
        wget \
        unzip \
        build-essential \
        libssl-dev \
        libffi-dev \
        libxml2-dev \
        libxslt1-dev \
        zlib1g-dev \
        libjpeg-dev \
        libpng-dev \
        libfreetype6-dev \
        liblcms2-dev \
        libwebp-dev \
        libopenjp2-7-dev \
        libtiff5-dev \
        libopenexr-dev \
        libgstreamer1.0-dev \
        libgstreamer-plugins-base1.0-dev \
        libgstreamer-plugins-bad1.0-dev \
        gstreamer1.0-plugins-base \
        gstreamer1.0-plugins-good \
        gstreamer1.0-plugins-bad \
        gstreamer1.0-plugins-ugly \
        gstreamer1.0-libav \
        gstreamer1.0-tools \
        gstreamer1.0-x \
        gstreamer1.0-alsa \
        gstreamer1.0-gl \
        gstreamer1.0-gtk3 \
        gstreamer1.0-qt5 \
        gstreamer1.0-pulseaudio \
        libgirepository1.0-dev \
        libcairo2-dev \
        libpango1.0-dev \
        libatk1.0-dev \
        libgdk-pixbuf2.0-dev \
        libgtk-3-dev \
        libavcodec-dev \
        libavformat-dev \
        libswscale-dev \
        libv4l-dev \
        libxvidcore-dev \
        libx264-dev \
        libjpeg-dev \
        libpng-dev \
        libtiff-dev \
        libatlas-base-dev \
        gfortran \
        libhdf5-dev \
        libhdf5-serial-dev \
        libhdf5-103 \
        libqtgui4 \
        libqtwebkit4 \
        libqt4-test \
        python3-pyqt5 \
        libgtk2.0-dev \
        libcanberra-gtk-module \
        libcanberra-gtk3-module \
        libgconf-2-4 \
        libnss3 \
        libxss1 \
        libasound2 \
        libxtst6 \
        xvfb \
        x11vnc \
        fluxbox \
        xterm \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*

# Install Python packages for MT4/MT5 integration
RUN pip3 install --no-cache-dir \
    MetaTrader5 \
    pandas \
    numpy \
    requests \
    websocket-client \
    python-dotenv \
    fastapi \
    uvicorn \
    pydantic \
    sqlalchemy \
    psycopg2-binary \
    redis \
    celery \
    flower \
    pytest \
    pytest-asyncio \
    black \
    flake8 \
    mypy \
    pre-commit

# Install Node.js packages globally
RUN npm install -g \
    nodemon \
    pm2 \
    typescript \
    ts-node \
    @types/node

# Create directories for logs
RUN mkdir -p /workspaces/quantum-risk-coach/backend/logs \
    && mkdir -p /workspaces/quantum-risk-coach/logs

# Set environment variables
ENV PYTHONPATH=/workspaces/quantum-risk-coach/backend/scripts:$PYTHONPATH
ENV NODE_ENV=development
ENV MT5_PATH=/usr/local/lib/python3.*/site-packages/MetaTrader5
ENV DISPLAY=:99

# Create startup script for Xvfb
RUN echo '#!/bin/bash\nXvfb :99 -screen 0 1024x768x24 &\nexec "$@"' > /usr/local/bin/start-xvfb.sh \
    && chmod +x /usr/local/bin/start-xvfb.sh

# Set the default command
CMD ["/usr/local/bin/start-xvfb.sh", "/bin/bash"]
