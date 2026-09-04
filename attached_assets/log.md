
2026-09-04T13:23:41.022182778Z stdout F       artifacts/api-server typecheck: Done
2026-09-04T13:23:39.592327079Z stdout F       scripts typecheck: Done
2026-09-04T13:23:38.785483496Z stdout F       scripts typecheck$ tsc -p tsconfig.json --noEmit
2026-09-04T13:23:38.785073342Z stdout F       artifacts/mockup-sandbox typecheck$ tsc -p tsconfig.json --noEmit
2026-09-04T13:23:38.784551048Z stdout F       artifacts/globaltrack typecheck$ tsc -p tsconfig.json --noEmit
2026-09-04T13:23:38.784145021Z stdout F       artifacts/api-server typecheck$ tsc -p tsconfig.json --noEmit
2026-09-04T13:23:38.782245784Z stdout F       Scope: 4 of 10 workspace projects
2026-09-04T13:23:38.781491399Z stdout F       (Use `node --trace-deprecation ...` to show where the warning was created)
2026-09-04T13:23:38.781110657Z stdout F       (node:249) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
2026-09-04T13:23:36.236232787Z stdout F 
2026-09-04T13:23:36.236205195Z stdout F       > tsc --build
2026-09-04T13:23:36.235690197Z stdout F       > workspace@0.0.0 typecheck:libs /workspace
2026-09-04T13:23:36.235645751Z stdout F 
2026-09-04T13:23:35.933918066Z stdout F 
2026-09-04T13:23:35.933094267Z stdout F       > pnpm run typecheck:libs && pnpm -r --filter "./artifacts/**" --filter "./scripts" --if-present run typecheck
2026-09-04T13:23:35.933090749Z stdout F       > workspace@0.0.0 typecheck /workspace
2026-09-04T13:23:35.933066468Z stdout F 
2026-09-04T13:23:35.609877266Z stdout F 
2026-09-04T13:23:35.609875901Z stdout F       > pnpm run typecheck && pnpm -r --if-present run build
2026-09-04T13:23:35.609873554Z stdout F       > workspace@0.0.0 build /workspace
2026-09-04T13:23:35.60986208Z stdout F 
2026-09-04T13:23:35.306600576Z stdout F 
2026-09-04T13:23:35.305574332Z stdout F   - Running `pnpm run build`
2026-09-04T13:23:35.305572665Z stdout F - Running scripts
2026-09-04T13:23:35.305567193Z stdout F   - Done (0.9s)
2026-09-04T13:23:35.305543567Z stdout F 
2026-09-04T13:23:35.276669271Z stdout F       Removed 4 packages
2026-09-04T13:23:35.119772473Z stdout F       Removed 19 files
2026-09-04T13:23:34.613941387Z stdout F       Removed all cached metadata files
2026-09-04T13:23:34.611127401Z stdout F       (Use `node --trace-deprecation ...` to show where the warning was created)
2026-09-04T13:23:34.611099243Z stdout F       (node:181) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
2026-09-04T13:23:34.324879175Z stdout F 
2026-09-04T13:23:34.324878017Z stdout F   - Running `pnpm store prune`
2026-09-04T13:23:34.324876009Z stdout F - Pruning unused dependencies from pnpm content-addressable store
2026-09-04T13:23:34.324873069Z stdout F   - Done (3.8s)
2026-09-04T13:23:34.324840057Z stdout F 
2026-09-04T13:23:34.301162269Z stdout F       Done in 3.8s using pnpm v9.15.9
2026-09-04T13:23:34.177917831Z stdout F       . preinstall: Done
2026-09-04T13:23:34.149511039Z stdout F       . preinstall$ node -e "const fs=require('fs'); for (const f of ['package-lock.json','yarn.lock']) { try { fs.rmSync(f,{force:true}); } catch {} } const ua=process.env.npm_config_user_agent||''; if(!ua.startsWith('pnpm/')) { console.error('Use pnpm instead'); process.exit(1); }"
2026-09-04T13:23:34.116646752Z stdout F 
2026-09-04T13:23:34.116645774Z stdout F       + typescript 5.9.3
2026-09-04T13:23:34.116643925Z stdout F       + prettier 3.8.3
2026-09-04T13:23:34.116628066Z stdout F       + lightningcss-win32-x64-msvc 1.32.0
2026-09-04T13:23:34.116248587Z stdout F       + @tailwindcss/oxide-win32-x64-msvc 4.2.2
2026-09-04T13:23:34.116246708Z stdout F       + @rollup/rollup-win32-x64-msvc 4.60.2
2026-09-04T13:23:34.116243037Z stdout F       devDependencies:
2026-09-04T13:23:34.116200466Z stdout F 
2026-09-04T13:23:33.721131968Z stdout F       .../esbuild@0.18.20/node_modules/esbuild postinstall: Done
2026-09-04T13:23:33.71251607Z stdout F       .../esbuild@0.27.7/node_modules/esbuild postinstall: Done
2026-09-04T13:23:33.71173203Z stdout F       .../esbuild@0.27.3/node_modules/esbuild postinstall: Done
2026-09-04T13:23:33.70807887Z stdout F       .../esbuild@0.25.12/node_modules/esbuild postinstall: Done
2026-09-04T13:23:33.649151658Z stdout F       .../esbuild@0.18.20/node_modules/esbuild postinstall$ node install.js
2026-09-04T13:23:33.648900655Z stdout F       .../esbuild@0.27.7/node_modules/esbuild postinstall$ node install.js
2026-09-04T13:23:33.648635727Z stdout F       .../esbuild@0.27.3/node_modules/esbuild postinstall$ node install.js
2026-09-04T13:23:33.648604346Z stdout F       .../esbuild@0.25.12/node_modules/esbuild postinstall$ node install.js
2026-09-04T13:23:33.420111001Z stdout F       Progress: resolved 551, reused 0, downloaded 551, added 551, done
2026-09-04T13:23:32.851054588Z stdout F       Progress: resolved 551, reused 0, downloaded 449, added 449
2026-09-04T13:23:31.854158731Z stdout F       Progress: resolved 551, reused 0, downloaded 212, added 206
2026-09-04T13:23:31.069167921Z stdout F 
2026-09-04T13:23:31.069166801Z stdout F          ╰───────────────────────────────────────────────────────────────────╯
2026-09-04T13:23:31.069164146Z stdout F          │                                                                   │
2026-09-04T13:23:31.069161149Z stdout F          │                 Run "pnpm add -g pnpm" to update.                 │
2026-09-04T13:23:31.068824955Z stdout F          │   Changelog: https://github.com/pnpm/pnpm/releases/tag/v11.25.0   │
2026-09-04T13:23:31.068822986Z stdout F          │                Update available! 9.15.9 → 11.25.0.                │
2026-09-04T13:23:31.06881832Z stdout F          │                                                                   │
2026-09-04T13:23:31.068569449Z stdout F          ╭───────────────────────────────────────────────────────────────────╮
2026-09-04T13:23:31.067818391Z stdout F 
2026-09-04T13:23:30.896068226Z stdout F       ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
2026-09-04T13:23:30.895737933Z stdout F       Packages: +551
2026-09-04T13:23:30.843450861Z stdout F       Progress: resolved 1, reused 0, downloaded 0, added 0
2026-09-04T13:23:30.80843917Z stdout F       Lockfile is up to date, resolution step is skipped
2026-09-04T13:23:30.767063067Z stdout F       Scope: all 10 workspace projects
2026-09-04T13:23:30.765431663Z stdout F       (Use `node --trace-deprecation ...` to show where the warning was created)
2026-09-04T13:23:30.765407671Z stdout F       (node:99) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
2026-09-04T13:23:30.434858506Z stdout F 
2026-09-04T13:23:30.434842774Z stdout F   - Running `pnpm install --frozen-lockfile`
2026-09-04T13:23:30.434817511Z stdout F - Installing dependencies
2026-09-04T13:23:29.832298752Z stdout F   - Creating pnpm virtual store
2026-09-04T13:23:29.832296201Z stdout F   - Creating new pnpm content-addressable store
2026-09-04T13:23:29.832275643Z stdout F - Setting up pnpm dependency store
2026-09-04T13:23:29.831977153Z stdout F   - Successfully installed `pnpm@9.15.9`
2026-09-04T13:23:29.831079266Z stdout F   - Extracting ... (< 0.1s)
2026-09-04T13:23:29.762154651Z stdout F   - GET https://registry.npmjs.org/pnpm/-/pnpm-9.15.9.tgz ... (< 0.1s)
2026-09-04T13:23:29.646730394Z stdout F - Installing pnpm
2026-09-04T13:23:29.646452299Z stdout F   - Resolved pnpm version `9.15.9` to `9.15.9`
2026-09-04T13:23:29.633497596Z stdout F   - GET https://registry.npmjs.org/pnpm ... (0.1s)
2026-09-04T13:23:29.519729296Z stdout F   - Found `packageManager` set to `pnpm@9.15.9` in `package.json`
2026-09-04T13:23:29.519565246Z stdout F - Determining pnpm package information
2026-09-04T13:23:29.516261369Z stdout F   - Installing Node.js `24.20.0 (linux-amd64)` ... (< 0.1s)
2026-09-04T13:23:29.515908072Z stdout F   - Extracting Node.js `24.20.0 (linux-amd64)`
2026-09-04T13:23:29.515902262Z stdout F   - Verifying checksum
2026-09-04T13:23:29.512367328Z stdout F   - Extracting ... (0.8s)
2026-09-04T13:23:28.701982921Z stdout F   - Validating ... (< 0.1s)
2026-09-04T13:23:28.662191315Z stdout F   - GET https://nodejs.org/download/release/v24.20.0/node-v24.20.0-linux-x64.tar.gz ... (0.3s)
2026-09-04T13:23:28.377141224Z stdout F - Installing Node.js distribution
2026-09-04T13:23:28.377139094Z stdout F   - Resolved Node.js version: `24.20.0`
2026-09-04T13:23:28.377137483Z stdout F   - Node.js version not specified, using `24.x`
2026-09-04T13:23:28.377135032Z stdout F - Checking Node.js version
2026-09-04T13:23:28.377132906Z stdout F 
2026-09-04T13:23:28.377123149Z stdout F ## Heroku Node.js
2026-09-04T13:23:28.376778586Z stdout F 
2026-09-04T13:23:28.333627538Z stdout F target distro name/version labels not found, reading /etc/os-release file
2026-09-04T13:23:28.312005777Z stdout F [info] BuildService - Starting BUILD Phase
2026-09-04T13:23:27.993871486Z stdout F Layer cache not found
2026-09-04T13:23:27.497568715Z stdout F [info] BuildService - Starting RESTORE Phase
2026-09-04T13:23:26.938493761Z stdout F Image with name "remote-registry/6a9ac63474e463183be3876b:6a9ac63574e463183be3876f" not found
2026-09-04T13:23:06.786817351Z stdout F [info] BuildService - Starting ANALYZE Phase
2026-09-04T13:23:06.786179398Z stdout F heroku/nodejs 5.7.15
2026-09-04T13:23:06.786171093Z stdout F 1 of 3 buildpacks participating
2026-09-04T13:23:06.775567401Z stdout F target distro name/version labels not found, reading /etc/os-release file
2026-09-04T13:23:06.735300641Z stdout F Warning: No analyzed metadata found at path "/layers/analyzed.toml"
2026-09-04T13:23:06.693777046Z stdout F [info] BuildService - Starting DETECT Phase
2026-09-04T13:23:06.66168189Z stderr F  * branch            e59532b468d1ff4ef80388d3aae9fc4e614611e4 -> FETCH_HEAD
2026-09-04T13:23:06.661334056Z stderr F From https://github.com/ghosttawn10-design/global-tracker
2026-09-04T13:23:05.939067265Z stderr F POST git-upload-pack (185 bytes)
2026-09-04T13:23:05.574377912Z stdout F Initialized empty Git repository in /workspace/.git/
2026-09-04T13:23:05.121530995Z stdout F [2026-09-04T13:23:05Z INFO ] Starting container entrypoint...
2026-09-04T13:23:05.12129835Z stdout F [2026-09-04T13:23:05Z INFO ] Successfully fetched environment variables

2026-09-04T13:23:05.121276287Z stdout F [2026-09-04T13:23:05Z INFO ] Securely fetching environment variables