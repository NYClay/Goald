# Goald Dev Container - Based on Node.js 20 with Android SDK and Expo
FROM mcr.microsoft.com/devcontainers/javascript-node:20-bookworm

# Install system dependencies for React Native / Expo / Android
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Android SDK dependencies
    openjdk-17-jdk-headless \
    # Build tools
    build-essential \
    python3 \
    python3-pip \
    # Expo/React Native deps
    libstdc++6 \
    libpulse0 \
    libx11-6 \
    libxext6 \
    libxrender1 \
    libxtst6 \
    libxi6 \
    libglib2.0-0 \
    libsm6 \
    libice6 \
    libfontconfig1 \
    libfreetype6 \
    # Utilities
    git \
    curl \
    wget \
    unzip \
    vim \
    htop \
    jq \
    # ADB for device debugging
    android-tools-adb \
    android-tools-fastboot \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set up Android SDK
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools:${ANDROID_SDK_ROOT}/emulator

# Install Android SDK command line tools
RUN mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools \
    && cd ${ANDROID_SDK_ROOT}/cmdline-tools \
    && wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip \
    && unzip -q cmdline-tools.zip \
    && mv cmdline-tools latest \
    && rm cmdline-tools.zip \
    && yes | ${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin/sdkmanager --licenses \
    && ${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin/sdkmanager \
        "platform-tools" \
        "platforms;android-34" \
        "build-tools;34.0.0" \
        "emulator" \
        "system-images;android-34;google_apis;x86_64"

# Set up Node.js environment for Expo
ENV NODE_ENV=development
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

# Install global npm packages for Expo development
RUN npm install -g \
    expo-cli@latest \
    eas-cli@latest \
    @expo/ngrok@latest \
    typescript@latest \
    tsx@latest \
    prettier@latest \
    eslint@latest

# Configure npm for the node user
RUN mkdir -p /home/node/.npm-global \
    && chown -R node:node /home/node/.npm-global \
    && npm config set prefix '/home/node/.npm-global'

# Set up environment for node user
ENV PATH=/home/node/.npm-global/bin:${PATH}
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

# Create workspace directory
WORKDIR /workspaces/Goald

# Set proper ownership
RUN chown -R node:node /workspaces/Goald

# Switch to node user
USER node

# Install project dependencies (cached in node_modules volume)
# This will be run when the container starts via postCreateCommand
# RUN npm ci --prefer-offline --no-audit --no-fund

# Expose ports for Expo
EXPOSE 8081 8082 19000 19001 19002 19006 8080 5554 5555

# Default command
CMD ["sleep", "infinity"]