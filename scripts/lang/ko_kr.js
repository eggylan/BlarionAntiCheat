import { setlang } from "util.js";

setlang({
    message: {
        global: {
            kick: "플레이어 $1 님이 치팅으로 인해 퇴장 처리됩니다, 감지된 항목: $2",
            ban: "플레이어 $1 님이 치팅으로 인해 차단되었습니다, 감지된 항목: $2",
            mute: "플레이어 $1 님이 도배로 인해 채팅 금지되었습니다, 감지된 항목: $2",
            freeze: "플레이어 $1 님이 치팅으로 인해 고정되었습니다, 감지된 항목: $2",
            imprison: "플레이어 $1 님이 치팅으로 인해 관리 대기열에 추가되었습니다, 감지된 항목: $2",

            load_successfully: "BlarionAntiCheat 메인 프로그램 초기화 완료, 차단 시스템 대기 중...",
            block_system_loaded: "BlarionAntiCheat 차단 시스템이 활성화되었습니다!"
        },
        disconnect: {
            kick: "안녕하세요 $1 님, 치팅 행위 ($2) 가 감지되어 퇴장 처리되었습니다"
        },
        warn: {
            cps_too_high: "경고, CPS가 너무 높습니다: $1/$2 CPS를 조절해주세요!"
        }
    },
    commands: {
        description: {
            getinv: "플레이어 인벤토리를 2개의 셜커 상자로 복사합니다 (주의: 개방된 지역에서 실행하세요, 상자가 블록 형태로 생성됩니다!)",
            forcekick: "대상을 강제로 연결 해제합니다 (AntiKick 대응용)",
            scan: "NBT 치터 흔적을 스캔하는 데 사용됩니다 (제작 중, 불안정)",
            blac: "Blarion 메인 명령어",
            flag: "플레이어를 표시하여 확장 모듈 연동에 사용됩니다"
        }
    }
})