# 问题及解决方案

## 运行问题

- electron: --openssl-legacy-provider is not allowed in NODE_OPTIONS

```bash
set | grep NODE_OPTIONS
unset NODE_OPTIONS
```

- WARNING: Secure coding is not enabled for restorable state! Enable secure coding by implementing NSApplicationDelegate. applicationSupportsSecureRestorableState: and returning YES.

```bash
export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
```

- CSP default-src 'self'; script-src 'self' 'unsafe-inline'冲突
