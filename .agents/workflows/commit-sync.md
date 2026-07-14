---
name: commit-sync
description: Automates Git commits inside submodules, syncs pointers, and pulls/pushes the Root repo safely.
---

# Git Submodule Commit & Sync Workflow

## Step 1: Kiểm tra trạng thái hệ sinh thái
1. Liệt kê tất cả các thay đổi chưa commit ở:
   - Thư mục Root
   - Submodule `WMS_Core`
   - Submodule `WMS_MCP_Server`
   - Submodule `WMS_AI_Services`
2. Hiển thị danh sách file thay đổi cho User dưới dạng bảng.

## Step 2: Commit các Submodules trước (Nếu có thay đổi)
1. Với mỗi submodule có thay đổi:
   - Hỏi ý kiến User về commit message.
   - Thêm file (`git add .`) và commit nội bộ.
   - Chạy lệnh `git push` để đẩy code của submodule lên remote tương ứng.

## Step 3: Đồng bộ và Reconcile tại Root
1. Chạy lệnh `git pull --rebase` tại Root để đồng bộ các commits mới nhất trên remote về máy local mà không tạo merge commits rác.
2. Thêm các pointer của submodule đã cập nhật và các file thay đổi tại Root (như `docker-compose.yml`).
3. Commit tại Root với định dạng message: `chore(root): sync submodules and update configs`.
4. Chạy `git push` để đẩy toàn bộ dự án lên GitHub.
