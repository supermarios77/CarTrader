FROM ubuntu:22.04

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install Postfix
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    postfix \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy configuration
COPY main.cf /etc/postfix/main.cf

# Create necessary directories
RUN mkdir -p /var/spool/postfix && \
    mkdir -p /var/lib/postfix && \
    postfix check || true

# Expose SMTP port
EXPOSE 25

# Start Postfix
CMD ["/usr/sbin/postfix", "start-fg"]

