# @luongduc96/create-react-micro-frontend

CLI scaffold cho project micro-frontend-portal, theo đúng cơ chế
`npm create vite@latest` dùng. Chạy lên sẽ hỏi muốn tạo gì:

```
Bạn muốn tạo gì?

  1) micro-frontend   toàn bộ portal (container + dashboard + about + contact)
  2) remote           một remote mới, nội dung giống Dashboard

Chọn (1/2, mặc định 1):
```

- **1) micro-frontend** — scaffold toàn bộ 4 thư mục (như trước giờ).
- **2) remote** — hỏi tên remote (vd `billing`), rồi tạo 1 thư mục mới với
  nội dung sao chép y hệt remote `dashboard` trong template (cùng cấu trúc
  pages/navigation/rspack config), chỉ đổi những chỗ định danh: tên trong
  `package.json`, `name` trong `module-federation.config.ts` (PascalCase,
  vd `Billing`), và `<title>` trong `index.html`. Dùng cho trường hợp đã có
  sẵn 1 project và muốn thêm remote thứ N mà không phải gõ lại từ đầu.
  Script in luôn 5 bước cần làm để ghép remote đó vào container (thêm env
  var, route, entry sidebar...) - hoặc chạy `sync-remote.mjs` ở gốc project
  đã scaffold để tự động hoá 5 bước đó.

Có thể bỏ qua bước hỏi bằng flag `--remote`:

```bash
npm create @luongduc96/react-micro-frontend@latest my-billing-remote -- --remote billing
```

Menu chọn/nhập dùng `@clack/prompts` (đọc phím mũi tên trực tiếp, giống
`create-vite`).

> **Không đổi `@clack/prompts` sang `^1.1.0` trở lên.** Từ bản `1.1.0`,
> `@clack/core` import `styleText` từ `node:util` - export này chỉ tồn tại
> từ Node **≥ 20.12.0**. Ai chạy Node thấp hơn (rất phổ biến, kể cả các
> bản Node 20.x sớm hơn) sẽ gặp `SyntaxError` ngay khi import, trước khi
> script kịp chạy dòng nào. `package.json` đang ghim cứng `"1.0.1"` (bản
> cuối cùng còn dùng `picocolors`, không có yêu cầu Node tối thiểu) - cố
> tình không dùng `^` để `npm install` không tự nhảy lên bản mới hơn.

## Vì sao dùng tên có scope

`npm publish` với tên không-scope `create-react-micro-frontend` bị npm từ
chối:

```
403 Package name too similar to existing package create-react-microfrontend
```

(npm chặn tên gần trùng - kể cả chỉ khác dấu gạch ngang - để chống
typosquatting, bất kể tên chính xác đó có ai đăng ký hay chưa. Không có
cách kiểm tra trước, chỉ biết khi publish thật. Cũng đã thử tên ngắn hơn
`create-micro-fe`, vẫn bị chặn vì gần trùng `create-microfe`.) Dùng scope
theo tên tài khoản npm tránh hẳn kiểu va chạm này - mỗi scope là một
namespace riêng, không so trùng với package của người khác.

Package đã publish thành công dưới tên
**`@luongduc96/create-react-micro-frontend`**. Cấu trúc:

```
create-micro-frontend-portal/
  package.json      # "name": "@luongduc96/create-react-micro-frontend", "bin": { "create-react-micro-frontend": "bin/index.js" }
  bin/index.js       # script scaffold - copy template/ ra thư mục đích
  template/           # bản sao container + dashboard + about + contact (không có node_modules/.dist)
```

(`bin` command vẫn để tên không-scope `create-react-micro-frontend` -
field này không bắt buộc phải trùng `name` có scope, chỉ cần khớp với
lệnh mà `npm exec`/`npx` sẽ chạy.)

## Test local trước khi publish

Không cần publish để thử — dùng `npm exec --package=<đường-dẫn-local>`,
đúng cơ chế `npm create` sẽ dùng sau khi publish. Vì lệnh có thêm bước hỏi
tương tác (chọn 1/2, tên remote), truyền `--remote` để bỏ qua hết các câu
hỏi khi test nhanh:

```bash
cd create-micro-frontend-portal

# mode 1: toàn bộ portal
npm exec --yes --package=. -- create-react-micro-frontend ../my-test-app
# kiểm tra ../my-test-app có đủ 4 thư mục + README + start-all.sh, rồi xoá đi

# mode 2: một remote, bỏ qua hết câu hỏi
npm exec --yes --package=. -- create-react-micro-frontend ../my-test-remote --remote billing
# kiểm tra ../my-test-remote có nội dung giống dashboard, package.json/module-federation
# đã đổi tên đúng, rồi xoá đi
```

(Tên `bin` command vẫn là `create-react-micro-frontend` không scope - chỉ
`name` trong `package.json`/tên lúc publish mới có scope. `npm exec
--package=.` chạy thẳng từ thư mục local nên không cần quan tâm scope ở
bước test.)

Muốn test đúng luồng hỏi tương tác (menu chọn mũi tên, không dùng
`--remote`) thì cách chắc ăn nhất vẫn là gõ tay trong terminal thật:

```bash
mkdir /tmp/scratch && cd /tmp/scratch
node ../create-micro-frontend-portal/bin/index.js
```

Prompt chọn mode (`Bạn muốn tạo gì?`) dùng `@clack/prompts` - đọc phím mũi
tên trực tiếp (raw keypress), **không** phải readline theo dòng, nên
`printf "2\nbilling\n" | node bin/index.js` sẽ không hoạt động ở bước chọn
mode nữa (chỉ prompt nhập text như tên remote mới nhận input kiểu đó).

Có kèm sẵn `.test-interactive.mjs` để giả lập gõ phím tự động (mũi tên +
Enter + gõ chữ, cách nhau 250ms) nếu cần test không cần ngồi gõ tay:

```bash
# DOWN = chọn "remote", ENTER = xác nhận, "billing" = gõ tên, ENTER = xác nhận
node .test-interactive.mjs /tmp/scratch DOWN ENTER billing ENTER

# ENTER = giữ mặc định "micro-frontend", "my-app" = gõ tên thư mục, ENTER
node .test-interactive.mjs /tmp/scratch ENTER my-app ENTER
```

## Publish lên npm

1. Đăng nhập (chỉ cần làm 1 lần trên máy):

   ```bash
   npm login
   ```

2. Publish (package có scope mặc định là private, **bắt buộc** phải thêm
   `--access public`, thiếu cờ này sẽ báo lỗi 402/403 khác):

   ```bash
   cd create-micro-frontend-portal
   npm publish --access public
   ```

3. Từ giờ bất kỳ ai cũng chạy được:

   ```bash
   npm create @luongduc96/react-micro-frontend@latest my-app
   # hoặc tương đương
   npx @luongduc96/create-react-micro-frontend@latest my-app
   ```

   Chạy không kèm gì thì script hỏi trước "muốn tạo gì" (1: toàn bộ portal,
   2: một remote) rồi mới hỏi tiếp tên thư mục/tên remote tương ứng.

## Cập nhật template sau khi publish

Mỗi khi sửa code trong `container/about/contact/dashboard` ở project gốc và
muốn bản scaffold có thay đổi đó:

1. Đồng bộ lại `template/` (loại trừ `node_modules`, `.dist`,
   `package-lock.json`, `.DS_Store`, `*.tsbuildinfo`):

   ```bash
   for app in container dashboard about contact; do
     rsync -a --delete --exclude 'node_modules/' --exclude '.dist/' \
       --exclude 'package-lock.json' --exclude '.DS_Store' --exclude '*.tsbuildinfo' \
       ../$app/ template/$app/
   done
   cp ../README.md template/README.md
   cp ../start-all.sh template/start-all.sh
   cp ../sync-remote.mjs template/sync-remote.mjs
   ```

2. Bump version trong `package.json` (`npm version patch --no-git-tag-version`).
3. `npm publish --access public` lại.

npm không cho publish đè lên một version đã tồn tại — mỗi lần publish phải
tăng version.
