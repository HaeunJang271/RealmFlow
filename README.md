# RealmFlow

**Gno.land Realm Scenario Playground** · Gnome Tavern Hackathon

RealmFlow는 Gno.land Realm의 함수를 탐색하고, 여러 호출을 하나의 시나리오로 구성해 순서대로 실행하는 웹 도구입니다. gnoweb으로 Realm을 둘러보는 데서 더 나아가 반복 가능한 호출 흐름, 결과 검증, 오류 설명, 시나리오 공유와 온체인 등록을 제공합니다.

## 주요 기능

- **Realm 함수 탐색** — Realm 경로를 불러와 공개 함수를 확인하고, 매개변수를 입력해 바로 실행하거나 시나리오에 추가합니다.
- **Call Sequence Runner** — `qeval` 조회와 `m_call` 트랜잭션을 순서대로 실행합니다. 단계의 순서 변경, 복제, 삭제와 예상 문자열 검증을 지원하며 실행 상태, 소요 시간, 출력을 보여줍니다.
- **Error Explainer** — 자주 발생하는 타입 불일치, 잔액 부족, 권한 오류 등의 원인과 해결 방법을 안내합니다.
- **시나리오 공유와 등록** — 시나리오가 포함된 URL을 복사하거나 Adena를 통해 RealmFlow Registry Realm에 등록합니다.
- **변수 연결** — `{{step1.output}}`을 이후 단계의 인자에 넣어 앞선 출력값을 전달합니다. 실행 로그에서 실제 전달된 인자를 확인할 수 있습니다.
- **소스와 CLI** — Live Mode의 Source 탭에서 `vm/qfile`로 `.gno` 파일을 탐색하고, 각 함수와 단계에서 `gnokey` 명령을 복사합니다.
- **Community Scenarios** — 데모 예제를 불러오거나, 설정한 Registry Realm에 등록된 시나리오를 탐색합니다.
- **Demo Mode** — 네트워크나 지갑 없이 blog, GovDAO, users, boards 및 registry Realm을 브라우저에서 시뮬레이션합니다. 데모 데이터는 브라우저 세션에만 유지됩니다.

## 시작하기

Node.js와 npm이 필요합니다. `npm test`는 Node.js 22.6 이상의 타입 제거 기능을 사용합니다.

```bash
npm install
npm run dev
```

터미널에 표시된 Vite 주소를 브라우저에서 엽니다. 프로덕션 빌드는 다음 명령으로 확인할 수 있습니다.

```bash
npm run build
```

## 사용 방법

1. 처음 열면 Demo Mode와 샘플 시나리오가 준비됩니다. **Run all steps**를 눌러 순차 실행 결과를 확인합니다.
2. 왼쪽에서 함수를 선택하고 인자를 입력한 뒤 **Run now** 또는 **Add to scenario**를 선택합니다.
3. 가운데에서 단계 이름, 실행 방식, Realm 경로, 함수, 인자와 예상 출력 문자열을 편집합니다. 단계별 화살표로 순서를 변경할 수 있습니다.
4. 오른쪽의 **Result**, **Render() view**, **Error explainer** 탭에서 결과와 오류를 확인합니다.
5. **Share**를 누르면 시나리오가 담긴 URL이 클립보드에 복사됩니다. 링크를 받은 사람은 같은 Realm과 단계 구성을 열 수 있습니다.

**Explore scenarios**에서 예제 또는 등록된 시나리오를 불러올 수 있습니다. **Settings**에서 Registry Realm 경로와 CLI에 사용할 키 이름을 바꾸고, Custom RPC를 사용할 경우 체인 ID를 지정하세요. 변수는 같은 실행에서 성공한 이전 단계만 참조하며 실패 시 후속 실행이 중단됩니다. 트랜잭션 단계의 출력은 지갑이 반환한 응답입니다.

실제 네트워크를 사용하려면 Demo Mode를 끄고 Realm을 다시 불러오세요. 기본 네트워크는 **Testnet Onyx** (`onyx-1`, `https://rpc.latest.testnets.gno.land:443`)입니다. 네트워크 선택기에서 **Mainnet** (`gnoland-1`, `https://rpc.gno.land:443`) 또는 **Custom RPC**를 선택할 수 있습니다. Custom RPC에는 공개 HTTPS 주소를 입력하세요. 조회는 지갑 없이 가능하며, 상태를 변경하는 `m_call`에는 선택한 네트워크에 맞게 설정된 [Adena](https://adena.app/)와 트랜잭션 승인이 필요합니다. `latest` 주소가 가리키는 테스트넷과 체인 ID는 변경될 수 있습니다.

**Publish**는 현재 시나리오를 `gno.land/r/gnoflow/registry`의 `RegisterScenario`로 전송합니다. 먼저 선택한 네트워크에 Registry Realm을 배포하고 Adena를 연결해야 합니다. 공유 URL과 온체인 등록 내용은 다른 사람이 읽을 수 있으므로 비밀 정보를 포함하지 마세요.

## Registry Realm 테스트와 배포

대상 네트워크에 맞는 Gno 툴체인과 잔액이 있는 키를 준비한 뒤 실행합니다.

```bash
cd realms/gnoflow_registry
gno test .

gnokey maketx addpkg \
  -pkgdir . \
  -pkgpath gno.land/r/gnoflow/registry \
  -gas-fee 1000000ugnot \
  -gas-wanted 3000000 \
  -broadcast \
  -remote https://rpc.latest.testnets.gno.land:443 \
  -chainid onyx-1 \
  YOUR_KEY
```

`YOUR_KEY`를 실제 값으로 바꾸고 해당 경로에 패키지를 배포할 권한을 확인하세요. 메인넷에 배포할 때는 RPC와 체인 ID를 각각 `https://rpc.gno.land:443`, `gnoland-1`로 바꾸세요. Gno API와 CLI 옵션은 네트워크 및 툴체인 버전에 따라 달라질 수 있으므로 Realm 코드를 대상 네트워크의 툴체인으로 확인하세요. 기본 Registry 경로는 직접 배포하기 전까지 존재하지 않을 수 있습니다.

## 프로젝트 구조

```text
api/rpc.ts                    Vercel JSON-RPC 프록시
src/App.tsx                   3개 패널 워크스페이스와 시나리오 실행기
src/lib/gno/rpcClient.ts      ABCI 조회 및 데모 Realm 정의
src/lib/gno/adena.ts          Adena 연결 및 Realm 호출
src/lib/errorExplainer.ts     오류 설명과 해결 제안
realms/gnoflow_registry/      시나리오 Registry Realm과 테스트
```

프런트엔드는 React 18, TypeScript, Vite, Tailwind CSS, lucide-react를 사용합니다. 브라우저의 RPC 조회는 로컬 개발 시 Vite 미들웨어를, Vercel 배포 시 서버리스 함수를 거칩니다. 프록시는 공개 HTTPS 엔드포인트로의 `abci_query` 요청만 전달합니다.
