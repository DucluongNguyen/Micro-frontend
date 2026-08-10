# Micro Frontend Portal

Portal micro-frontend dùng **Module Federation** (rspack), gồm 1 container
(host) và 3 remote độc lập. Mỗi app là một dự án rspack/React/TypeScript
riêng biệt, build và deploy tách rời, được container ghép lại tại runtime.

## Kiến trúc

```
container   (host, port 3008)  →  Sidebar, routing, auth, Redux store dùng chung
 ├─ dashboard  (remote, port 3009)  →  mount tại /dashboard/*
 ├─ about      (remote, port 3010)  →  mount tại /about/*
 └─ contact    (remote, port 3011)  →  mount tại /contact/*
```

- **container**: sở hữu layout (Sidebar + Header), route table cấp cao nhất,
  màn hình đăng nhập/guard xác thực, và Redux store dùng chung (expose qua
  `./store`). Không biết trước cấu trúc trang nội bộ của remote — chỉ mount
  mỗi remote tại `/<name>/*` và để remote tự định tuyến bên trong.
- **dashboard / about / contact**: mỗi remote expose `./App` (component gốc)
  và `./navigation` (danh sách route để container build sidebar). Có thể
  chạy độc lập (standalone dev) hoặc chạy lồng trong container.
- Các package dùng chung giữa host và remote (`react`, `react-dom`,
  `react-router-dom`, `react-redux`) được khai báo `singleton: true` trong
  `module-federation.config.ts` của từng app để tránh load trùng bản.

Chi tiết sâu hơn cho từng app (auth flow, cách thêm remote mới, sidebar
động, v.v.) nằm trong README riêng của từng thư mục:
[`container/README.md`](container/README.md),
[`dashboard/README.md`](dashboard/README.md),
[`about/README.md`](about/README.md),
[`contact/README.md`](contact/README.md).

## Yêu cầu

- Node.js 22.x, npm 10.x
- macOS/Linux (script `start-all.sh` dùng bash)

## Cài đặt

Mỗi app có `node_modules` riêng, phải cài từng thư mục:

```bash
cd container && npm install && cd ..
cd dashboard && npm install && cd ..
cd about && npm install && cd ..
cd contact && npm install && cd ..
```

## Chạy dev

**Chạy cả 4 app cùng lúc** (khuyến nghị — container cần cả 3 remote sống để
render `/dashboard`, `/about`, `/contact`):

```bash
./start-all.sh
```

Script chạy song song `npm start` ở cả 4 thư mục trong 1 terminal, mỗi dòng
log gắn prefix `[container]` / `[dashboard]` / `[about]` / `[contact]` với
màu riêng để dễ phân biệt. `Ctrl+C` để dừng tất cả.

**Chạy riêng từng app** (ví dụ chỉ đang sửa `contact`):

```bash
cd contact && npm start
```

Remote nào không chạy sẽ được `container` bỏ qua kèm cảnh báo trong console
thay vì crash (xem `module-federation.config.ts` của container).

| App | URL dev | Vai trò |
| --- | --- | --- |
| container | http://localhost:3008 | Host — điểm vào chính |
| dashboard | http://localhost:3009 | Remote, mount tại `/dashboard/*` |
| about | http://localhost:3010 | Remote, mount tại `/about/*` |
| contact | http://localhost:3011 | Remote, mount tại `/contact/*` |

Đăng nhập ở `/login` (form mock, chấp nhận username/password bất kỳ khác
rỗng) trước khi vào các route còn lại — xem phần Authentication trong
`container/README.md`.

## Cấu hình môi trường

Mỗi app đọc biến môi trường qua `.env.<NODE_ENV>` (dotenv-flow). Riêng
container cần biết URL `remoteEntry.js` của từng remote:

```bash
# container/.env.development
URL_HOST_DASHBOARD=Dashboard@http://localhost:3009/remoteEntry.js
URL_HOST_ABOUT=About@http://localhost:3010/remoteEntry.js
URL_HOST_CONTACT=Contact@http://localhost:3011/remoteEntry.js
```

Đổi domain/port khi deploy chỉ cần sửa các biến này trong
`.env.sit` / `.env.uat` / `.env.staging` / `.env.production` tương ứng —
không cần sửa code.

## Scripts (chạy trong từng thư mục app)

| Script | Mục đích |
| --- | --- |
| `npm start` | Dev server có HMR |
| `npm run build` | Build production (dùng `NODE_ENV` hiện tại) |
| `npm run build:sit` / `build:uat` / `build:staging` / `build:prod` | Build theo từng môi trường, đọc `.env.<env>` tương ứng |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` | Prettier |

## Build & Deploy

Mỗi app build ra thư mục `.dist/` rồi đóng gói bằng `Dockerfile` riêng
(multi-stage: build bằng Node 22, phục vụ tĩnh bằng nginx). Mỗi app deploy
độc lập, thường ở domain/sub-path riêng — `nginx/nginx.conf` của mỗi app
serve tại root (`/`) với SPA fallback (`try_files $uri /index.html`) để
client-side routing hoạt động cả khi reload ở route lồng nhau
(ví dụ `/contact/form`).

```bash
docker build -t container --build-arg ENVIRONMENT_BUILD=prod ./container
docker build -t dashboard --build-arg ENVIRONMENT_BUILD=prod ./dashboard
docker build -t about --build-arg ENVIRONMENT_BUILD=prod ./about
docker build -t contact --build-arg ENVIRONMENT_BUILD=prod ./contact
```

Sau khi build, cập nhật `URL_HOST_*` trong `.env.prod` (hoặc file env tương
ứng) của container trỏ đến domain thật của từng remote đã deploy.

## Thêm một remote mới

```bash
npm create micro-fe@latest -- --remote billing   # scaffold ./billing, nội dung giống dashboard
node sync-remote.mjs billing                      # đồng bộ vào container + start-all.sh
cd billing && npm install && cd ..
./start-all.sh                                     # giờ chạy cả remote vừa tạo
```

`sync-remote.mjs` ở gốc project tự động hoá toàn bộ phần việc thủ công:

- Gán 1 dev port trống cho remote (template mặc định luôn là 3009, trùng
  với `dashboard` - script tự đổi sang port chưa ai dùng).
- Thêm entry vào `REMOTE_DEFINITIONS` (`container/module-federation.config.ts`).
- Thêm `URL_HOST_<NAME>` vào `container/.env.development` và `.env.production`.
- Thêm `declare module '<Name>/App'` + `'<Name>/navigation'` vào
  `container/src/types/remotes.d.ts`.
- Thêm route mounted tại `/<name>/*` vào `container/src/router/routes.tsx`.
- Thêm entry vào `REMOTES` trong `container/src/hooks/useRemoteNavigation.ts`
  để remote hiện trên sidebar.
- Thêm remote vào `APPS`/`COLORS` trong `start-all.sh`.

An toàn khi chạy lại nhiều lần — mỗi bước tự kiểm tra đã tồn tại chưa trước
khi thêm, không bị nhân đôi.

Muốn làm thủ công thay vì dùng script, xem mục "Adding another remote"
trong [`container/README.md`](container/README.md).
