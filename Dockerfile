FROM calciumion/new-api:latest

USER root

RUN useradd -m -u 1000 appuser \
    && mkdir -p /data/logs \
    && chown -R 1000:1000 /data

ENV PORT=3000
ENV TZ=Asia/Shanghai
ENV SQLITE_PATH=/data/one-api.db?_busy_timeout=30000

USER 1000

CMD ["--log-dir", "/data/logs"]
