# 짐벌 없는 핸드헬드 시네마틱 촬영용 카메라 비교 (손떨림 보정 중심, 2026-11-10 기준, 일본 시장)

표기 규칙: **[공식]** 제조사 스펙 / **[랩]** CineD 등 측정값 / **[리뷰]** 리뷰·사용기 인상 / **[추론]** 근거에서 끌어낸 판단 / **[미검증]** 조사자 사전지식이며 이번 조사에서 URL로 확인하지 못함(보고서에 쓰려면 재확인 필요).

조사 범위 한계: 도구 호출 약 15회 안에서 진행했다. 기종 존재 여부, Gyroflow 지원, CineD 롤링셔터 값, R8 II와 S5II 손떨림 보정 리뷰는 확인했다. GH6, S5(초대), FX30, Osmo Pocket 3, a7C II, ZV-E1의 세부 스펙 상당수는 [미검증]으로 남았다.

## Q1. 기종 존재 확인 (R8 Mark II, R6 Mark III)

### Takeaway
EOS R8 Mark II는 실제 제품이다. 2026-09-15 발표, IBIS 탑재, 일본에서도 판매 중이다. EOS R6 Mark III도 2025년 말 출시된 실제 제품이다. 따라서 "존재 미확인" 표기는 필요 없다.

### Cited Findings
- [공식] Canon USA가 2026-09-15 R8 Mark II를 발표했다: "Canon Introduces the EOS R8 Mark II Full-Frame Camera" — [Canon USA newsroom](https://www.usa.canon.com/newsroom/2026/20260915-consumer)
- [공식] 일본 Canon(personal.canon.jp)이 "EOS R8 Mark II 発売記念キャンペーン"(20,000엔 캐시백, 예약분 포함)을 진행 중이다. 일본 판매가 확인된다 — [canon.jp R8 Mark II 페이지 / 캠페인](https://personal.canon.jp/product/campaign/r8mk2)
- [공식/보도] R8 II 스펙: 24.2MP 풀프레임, DIGIC X, 5축 IBIS(R8에는 없던 기능), Coordinated Control(바디+렌즈 IS)과 Peripheral Coordinated Control, 6K 오버샘플링 무크롭 4K 60p, FHD 180p, 10-bit 4:2:2 XF-HEVC S/XF-AVC S, SD 싱글 슬롯, LP-E17, 499g(바디). 4K 59.94p 연속 녹화 약 40분. 가격은 미국 기준 바디 $1,899 — [Newsshooter](https://www.newsshooter.com/2026/09/15/canon-announces-eos-r8-mark-ii-adds-in-body-stabilization-keeps-24-2mp-sensor/)
- [공식/리뷰] IBIS 등급은 중앙 7.5스톱, 주변부 7.0스톱 — [The-Digital-Picture R8 II review](https://www.the-digital-picture.com/Reviews/Canon-EOS-R8-Mark-II.aspx)
- [공식] R6 Mark III 스펙 페이지가 Canon Asia에 있다 — [Canon Asia R6 III spec](https://asia.canon/en/consumer/eos-r6-mark-iii-body/specification)
- [보도] R6 III: 32.5MP 풀프레임, 7K 60p RAW, 오버샘플링 4K 120p, 오픈게이트, 40fps, CFexpress B + SD 슬롯 — [Fstoppers](https://fstoppers.com/gear/canon-eos-r6-mark-iii-here-325-mp-40-fps-and-7k-video-familiar-body-716379); [DIYPhotography](https://www.diyphotography.net/?p=309649)
- [보도, 출처 충돌] R6 III IBIS는 대부분 출처가 중앙 8.5스톱/주변 7.5스톱이라고 적었다. PetaPixel 스펙표와 출시 전 루머는 6.5스톱이었다. 출시 후 자료와 리뷰 다수가 8.5스톱이므로 8.5스톱 쪽이 더 신뢰할 만하다 — [PetaPixel pixelmeter](https://petapixel.com/pixelmeter/canon-eos-r6-mark-iii/); [Videomaker](https://www.videomaker.com/news/canon-announces-eos-r6-mark-iii-full-frame-mirrorless-camera/)

### Inferences
- 일본 공식 R8 II 제품 스펙 페이지(canon.jp/eos-r8m2)는 이번 fetch에서 본문을 읽지 못했다. 일본 판매는 캠페인 페이지로 확인했다. 그래도 일본판 스펙의 "動画電子IS" 단계와 크롭률은 직접 확인해야 한다.

### Gaps
- R6 III의 canon.jp 일본어 스펙(동영상 IS 모드별 크롭)은 직접 확인하지 못했다.

## Q2. 기종별 비교표

범례: Gyro = 카메라 내부 자이로 메타데이터 기록과 Gyroflow 공식 지원 여부(docs.gyroflow.xyz 기준). RS = 롤링셔터 리드아웃(ms).

| 기종 | 센서 | IBIS(공칭) | 동영상 IS 모드·크롭 | 렌즈 OIS 협조 | Gyro/Gyroflow | 4K60·크롭 / 10bit log | RS (ms) | AF·저조도 |
|---|---|---|---|---|---|---|---|---|
| Canon EOS R8 (기준) | FF 24.2MP [공식, R8 II 기사 내 비교] | **없음** [공식] | Movie Digital IS(On/Enhanced), 크롭 있음 [미검증] | 렌즈 IS + Digital IS 협조 [미검증] | ❌ 목록에 없음 [공식: Gyroflow Canon 페이지] | 6K 오버샘플링 4K60 무크롭, C-Log3 10bit [미검증] | 14.5 (R8 II와 동일하다고 리뷰가 언급) [리뷰] | DPAF II, FF 저조도 양호 [추론] |
| **Canon EOS R8 Mark II** (2026-09 발표) | FF 24.2MP [공식] | 있음, 7.5스톱(주변 7.0) [공식] | Movie Digital IS, "약간의 크롭"으로 가장자리 흔들림 억제 [리뷰] | Coordinated Control + Peripheral Coordinated Control(초기에는 RF10-20/16-28 정지영상만) [공식/리뷰] | ❌ Gyroflow Canon 목록에 없음 [공식] | 4K60 무크롭(6K 오버샘플링), C-Log3 10bit 4:2:2 [공식] | 14.5 [리뷰: digital-picture 요약], "비교적 빠름" [리뷰: PetaPixel] | DPAF II 100% 커버, AI 피사체 인식 [보도] |
| Canon EOS R6 Mark III | FF 32.5MP [공식] | 8.5스톱(주변 7.5), 일부 출처 6.5 [보도·충돌] | Movie Digital IS [미검증] | Coordinated Control [미검증] | ✅ 자이로 기록 + 지원 렌즈는 자동 렌즈 프로파일 [공식: Gyroflow] | 7K 오픈게이트, 4K120 오버샘플링, C-Log [보도] | CineD 값 못 찾음. 비적층 센서라 전자셔터 RS 잔존 [리뷰] | FF 32.5MP |
| Canon EOS R7 | APS-C 32.5MP [미검증] | 있음(공칭 7~8스톱) [미검증] | Movie Digital IS [미검증] | Coordinated Control [미검증] | ❌ 목록에 없음 [공식] | 4K60 있음, C-Log3 [미검증] | **15.0** (APS-C, 4K 25p H.265) [랩: CineD DB] | APS-C, DPAF II |
| Panasonic GH6 | MFT 25MP [미검증] | 7.5스톱(바디 단독) [보도: Camera Jabber/GSMArena] | E-Stabilization(크롭), Boost IS(고정 촬영용) [리뷰: DVinfo] | Dual I.S. 2 [미검증] | ❌ Panasonic 소비자 기종은 자이로 미기록 [공식 docs 답변 요약] | 4K60 무크롭, 5.7K, V-Log L [미검증] | CineD 값 못 찾음 | 콘트라스트 AF(DFD), 영상 AF는 약점이라는 평판 [미검증] |
| Panasonic GH7 | MFT 25MP [미검증] | 공칭 7.5스톱 [미검증] | Active I.S., 대보정 시 주변 왜곡을 프레임마다 보정, Boost IS [공식: panasonic.jp GH7] | Dual I.S. 2 [미검증] | ❌ [공식 docs 답변 요약] | 4K60 무크롭, V-Log, ProRes(RAW) [미검증] | **13.2** (4K 4096, ProRes HQ, Full Sensor 25p), 오픈게이트 5.7K 4:3은 20.8 [랩: CineD DB] | 위상차 AF 탑재 [미검증] |
| Panasonic S5 (초대) | FF 24MP [미검증] | 5스톱(Dual IS 6.5) [미검증] | E-Stab [미검증] | Dual I.S. 2 [미검증] | ❌ | 4K60 APS-C 크롭 [미검증] | 미확인 | DFD 콘트라스트 AF, 영상 AF 흔들림(wobble) 평판 [미검증] |
| Panasonic S5 II | FF 24MP [미검증] | 바디 5스톱, 렌즈 연동 6.5스톱 [공식 인용: デジカメWatch] | **Active I.S.**(물리 보정, 화각 유지), 電子補正(약간 크롭), 手ブレ補正ブースト(고정용) [리뷰: デジカメWatch, Video SALON] | Dual I.S. 2 [공식 인용] | ❌ [공식 docs 답변 요약] | **4K60은 APS-C 크롭**, FF 무크롭은 4K30까지 [리뷰: Video SALON]. V-Log [미검증] | **22.0** FF / 14.3 APS-C / 25.4 (5.9K 3:2 오픈게이트) [랩: CineD] | 像面位相差AF, 보행 인터뷰 추종 양호 [리뷰: Video SALON] |
| Panasonic S5 IIX | S5II와 같은 센서·IS [미검증] | S5II와 동일 [미검증] | 동일 | 동일 | ❌ | ProRes/All-I, RAW 출력 추가 [미검증] | S5II와 동일할 것 [추론] | 동일 |
| Sony ZV-E10 II | APS-C 26MP (a6700/FX30와 같은 센서) [리뷰: Newsshooter/DPReview] | **없음** [리뷰] | Active(전자)만 있음. 렌즈 대비 1.33x 추가 크롭 [리뷰: DPReview]. 합산 약 1.5x [리뷰: Sansmirror] | OSS 렌즈 연동 [미검증] | ✅ [공식: Gyroflow Sony] | 6K 오버샘플링 4K60 [리뷰: Newsshooter]. 1.1x 기본 크롭은 확인 못함 [충돌]. S-Log3 [미검증] | 미확인 | AI AF [미검증] |
| Sony a6700 | APS-C 26MP | 있음(5스톱) [미검증] | Active 모드. 보행 촬영 양호, 화각 의존 [리뷰: 47prefectures] | OSS 연동 | ✅ 렌즈 브리딩 보정 데이터도 기록 [공식: Gyroflow] | 4K60 오버샘플링, 4K120은 1.58x 크롭 [리뷰: DPReview 인용] | **15.9** (4K 25p), 4K120 크롭 모드는 8.1 [랩: CineD] | AI AF, 듀얼 게인 아님 [미검증] |
| Sony FX30 | APS-C 26MP | 있음(Active 지원) [리뷰: gearframe 비교] | Active [미검증] | OSS | ✅ [공식: Gyroflow] | 4K60, 4K120 1.6x 크롭 [미검증]. S-Log3, Cine EI, 듀얼 베이스 ISO 800/2500 [미검증] | CineD 값 없음. 15.7은 독자 댓글이라 미검증 [Y.M.Cinema 댓글] | 팬 내장 |
| DJI Osmo Pocket 3 (비ILC 참고) | 1인치 [미검증] | 3축 기계식 짐벌 [미검증] | 짐벌 | – | Gyroflow DJI 목록에 Pocket 3 없음(짐벌이라 필요 없음) [공식: Gyroflow DJI] | 4K120, D-Log M 10bit [미검증] | – | – |
| (추가) Panasonic G9 II | MFT 25MP | 8스톱 [리뷰] | Active I.S. 보행·패닝용 [리뷰]. E-stab High 약 1.255x 크롭 [리뷰: EOSHD 포럼] | Dual I.S. 2 | ❌ | 5.7K [보도] | CineD DB 13.2(Full Sensor 25p). GH7과 같은 값이라 확인 필요. RTINGS는 빠른 팬에서 RS가 눈에 띈다고 함 [랩/리뷰] | 위상차 AF |
| (추가) Sony a7C II / ZV-E1 | FF | a7C II는 IBIS, ZV-E1은 IBIS + Dynamic Active [미검증] | Dynamic Active 지원은 Gyroflow 1.7.0부터 [공식: Gyroflow] | OSS | ✅ 둘 다 [공식: Gyroflow] | [미검증] | 미확인 | ZV-E1은 12MP라 저조도 강점 [미검증] |

### Takeaway
보행 + 팬/틸트 용도에서 결정적인 차이는 두 가지다. ① 물리 IBIS가 있는가(R8 초대와 ZV-E10 II는 없음). ② 후처리 Gyroflow가 가능한가. 이 조건에서는 Gyroflow를 쓸 수 있는 Sony(a6700, FX30, ZV-E10 II, a7C II, ZV-E1)와 Canon R6 III가 유리하다. 반대로 IBIS로 화각을 유지한 채 카메라 내부에서 끝내고 싶다면 Panasonic Active I.S.(S5II, GH7, G9 II)가 강하다. R8 II는 IBIS가 생겨 R8의 가장 큰 약점은 해소했지만, Gyroflow 목록에는 아직 없다.

### Cited Findings (표 보충)
- [공식] Gyroflow Canon 지원 목록: C50/C80/C400, R6 Mark III ✅, R6 Mark II ❌, R6 V ✅, R5 ❌, R5 Mark II ✅. R8, R8 II, R7은 목록에 없다. Canon은 렌즈 IS, Digital IS, IBIS를 **모두 꺼야** 하고, 자이로 타이밍이 100% 정확하지 않아 Auto Sync가 필요할 수 있다 — [Gyroflow docs: Canon](https://docs.gyroflow.xyz/app/getting-started/supported-cameras/canon)
- [공식] Gyroflow Sony 목록: α7C II, ZV-E1, ZV-E10, ZV-E10 II, a6700, FX30, FX3 등 ✅, α6600 ❌. **IBIS/OIS를 켠 채 녹화 가능**(메타데이터로 보정을 되돌림). Active·Dynamic Active도 지원하지만 카메라 안에서 크롭되므로 "Standard + Gyroflow"를 권장한다. α7S III 4K120처럼 자이로를 기록하지 않는 모드도 있다 — [Gyroflow docs: Sony](https://docs.gyroflow.xyz/app/getting-started/supported-cameras/sony)
- [공식, AI 답변 요약] Gyroflow docs 질의 응답은 Panasonic 소비자 기종이 자이로를 내부 기록하지 않아 외부 자이로나 Optical correction(1.7.0+)이 필요하다고 답했다. Panasonic 전용 페이지는 없다 — [Gyroflow docs query](https://docs.gyroflow.xyz/app/getting-started/supported-cameras.md)
- [공식] Nikon은 자이로를 기록하지 않는다(Z f, Z6III 포함 추정) — [Gyroflow docs: Nikon](https://docs.gyroflow.xyz/app/getting-started/supported-cameras/nikon)
- [랩] CineD 비교 기준: Sony a7S III 8.7ms, Canon R3 9.5ms — [CineD 검색 요약(R3 lab test)](https://www.cined.com/es/canon-eos-r3-lab-test-rolling-shutter-dynamic-range-and-latitude-test/)
- [랩] GH7 13.2ms / 20.8ms(오픈게이트) — [CineD GH7 lab test](https://www.cined.com/panasonic-lumix-gh7-lab-test-rolling-shutter-dynamic-range-and-latitude/); [CineD DB](https://www.cined.com/camera-database/?camera=LUMIX-GH7)
- [랩] S5 II 22ms FF / 14.3ms APS-C / 25.4ms 오픈게이트 — [CineD S5 II lab test](https://www.cined.com/panasonic-lumix-s5-ii-lab-test-rolling-shutter-dynamic-range-and-latitude/)
- [랩] a6700 15.9ms(4K25p) / 8.1ms(4K120 크롭) — [CineD a6700 lab test](https://www.cined.com/sony-a6700-lab-test-rolling-shutter-dynamic-range-and-latitude/)
- [랩] R7 15ms — [CineD DB R7](https://www.cined.com/camera-database/?camera=EOS-R7)
- [리뷰] R8 II는 R8과 센서 리드아웃이 같다(R6 II, R8, R8 II 동일) — [The-Digital-Picture](https://www.the-digital-picture.com/Reviews/Canon-EOS-R8-Mark-II.aspx). 14.5ms라는 수치는 검색 요약에서 나왔고 원문 줄은 직접 확인하지 못했다.
- [리뷰] R8 II는 R8의 큰 약점이던 IBIS를 추가했다. 약간의 크롭이 있는 디지털 IS로 프레임 가장자리 흔들림(wobble)을 거의 없앤다. 녹화 중 히스토그램이 사라지고, Cinema View는 Log와 함께 쓸 수 없다 — [PetaPixel R8 II review](https://petapixel.com/2026/09/15/canon-eos-r8-mark-ii-review-a-great-camera-in-a-polarizing-package/)
- [리뷰] R8 II는 광학 IS, IBIS, Digital Movie IS의 Coordinated IS를 지원한다. 삼각대 사용 시 framing drift 때문에 IS를 끄라고 권장한다 — [The-Digital-Picture](https://www.the-digital-picture.com/Reviews/Canon-EOS-R8-Mark-II.aspx)
- [리뷰] R6 III: 비적층 센서라 전자셔터 RS가 남는다. CanonRumors는 리드아웃이 빨라진 대신 약간의 대가(노이즈/DR)가 있다고 봤다 — [Fstoppers 실사용 테스트](https://fstoppers.com/reviews/canon-r6-mark-iii-real-world-test-stabilization-rolling-shutter-and-heat-716984); [CanonRumors](https://www.canonrumors.com/canon-r6-mark-iii-high-iso-and-dynamic-range-good-but-not-class-leading)

### Inferences
- [추론] S5 II는 4K60이 APS-C 크롭이다. 이 경우 RS는 14.3ms로 좋아지지만 화각이 1.5배 좁아져 흔들림이 더 커 보인다. FF 4K30은 RS 22ms로 빠른 팬에서 젤로 현상이 보일 수 있다.
- [추론] ZV-E10 II는 IBIS가 없어 Active를 켜면 약 1.5x 크롭이 된다. 다만 Gyroflow를 쓰면 IS를 끄고 후처리로 보정할 수 있어 IBIS가 없는 약점이 줄어든다(셔터를 빠르게 해 모션블러를 줄여야 함).

### Gaps
- R8 II와 R8의 Movie Digital IS "On/Enhanced" 크롭률(%)은 이번에 공식 확인하지 못했다.
- CineD 측정값이 없는 기종: R8, R8 II, R6 III, GH6, S5, ZV-E10 II, FX30. FX30의 15.7ms는 독자 댓글이라 쓸 수 없다 — [Y.M.Cinema](https://ymcinema.com/2022/09/29/sony-fx30-tests-demonstrate-serious-rolling-shutter-artifacts/)
- ZV-E10 II의 4K60 1.1x 기본 크롭은 출처끼리 충돌한다. DPReview는 1.33x(Active), Sansmirror는 약 1.5x 합산이라고 적었다 — [DPReview ZV-E10 II](https://www.dpreview.com/reviews/8510905811/3); [Sansmirror](https://sansmirror.com/newsviews-2/2023-and-2024-news/the-sony-aps-c-vlogger-gets.html)
- G9 II의 CineD 13.2ms가 GH7과 똑같아 검색 요약이 섞였을 가능성이 있다. 확인이 필요하다.

## Q3. 실제 보행 안정성과 팬/틸트 자연스러움 (리뷰 근거)

### Takeaway
Panasonic S5II의 Active I.S.(물리 보정)는 화각을 유지하면서 보행 흔들림을 크게 줄인다. 자연스러운 상하 흔들림을 조금 남겨 "액션캠 느낌"이 덜하다는 평이 일본 리뷰에서 나왔다. 반면 전자 보정을 겹치면 카메라를 움직일 때 **揺り戻し(되돌아감)에 의한 부자연스러운 끊김**이 지적됐다. 이는 "팬 끝에서 떠다니는/되돌아가는(float/drift)" 현상과 같은 계열의 증상이다. 같은 조건에서 3사를 비교한 정량 영상 리뷰는 이번 조사에서 찾지 못했다.

### Cited Findings
- [리뷰] S5II 보행 테스트(20-60mm 광각, 렌즈 IS 없음): IS OFF는 크게 흔들리고, 일반 보정(=Active I.S.)은 흔들림을 대폭 줄이며 **화각이 줄지 않는다**. 전자 보정을 켜면 더 안정되지만 화각이 다소 좁아진다. 제조사 설명은 축별 보정량 독립 제어로 20mm에서 S5 대비 최대 약 200% 크기의 흔들림까지 보정한다는 것 — [デジカメWatch S5II Active I.S. 리뷰](https://dc.watch.impress.co.jp/docs/review/newproduct/1498951.html)
- [리뷰] S5II: 물리 보정만으로 슬라이드 이동이 "위화감 없이 부드럽다"(짐벌이나 슬라이더 같은 표현 가능). **전자 보정을 켜고 카메라를 움직이면 揺り戻し로 부자연스러운 카쿠쓰키가 두드러진다.** FIX(고정)에서는 강력하다. S5 대비 상하 흔들림 방식이 다르고, 카메라를 흔들 때 부자연스러운 왜곡이 사라졌다. 달리기는 보정이 따라가지 못하며 OFF가 나을 수도 있다. 자연스러운 상하 흔들림이 남아 현장감이 유지된다는 평가 — [Video SALON S5II 리뷰](https://videosalon.jp/report/lumix-s5ii-review/)
- [공식] GH7: 보행 촬영 때 생기기 쉬운 대보정 시 주변 왜곡을 프레임마다 보정한다 — [panasonic.jp GH7 기능 페이지](https://panasonic.jp/dc/feature/GH7/mobility-expression.html)
- [리뷰] GH6 Boost IS는 삼각대에 가까운 결과를 내지만 전자식이라 크롭이 있다. 보행에는 렌즈와 바디 IS를 권장한다. 삼각대에서 IS를 끄면 의도한 팬과 싸우지 않는다 — [DVinfo 포럼](https://www.dvinfo.net/forum/panasonic-lumix-s-g-gf-gh-gx-series/538811-gh6-stabilization-lens-camera.html)
- [리뷰, 의견 충돌] DPReview 포럼: S5II가 A7 IV/A7R V보다 영상 IS가 낫고 GH6보다도 약간 낫다는 의견과, Sony가 여전히 낫다는 의견이 있다. Sony Active는 광각에서 주로 경쟁력이 있다 — [DPReview forum: S5 II IBIS test](https://www.dpreview.com/forums/threads/s5-ii-video-ibis-test-on-youtube.4706587/); [DPReview forum: S5 II vs A7IV](https://www.dpreview.com/forums/threads/is-the-ibis-of-the-s5-ii-only-on-the-same-level-than-the-a7iv.4691875/)
- [리뷰] a6700 Active 모드: 손에 들고 걷는 촬영이 충분히 가능하다. 흔들림이 얼마나 눈에 띄는지는 화각에 크게 좌우된다 — [47prefectures a6700 리뷰](https://47prefectures.com/sony-a6700-review/)
- [리뷰] R8 II: IBIS가 손떨림을 크게 개선했다. 디지털 IS를 쓰면 약간의 크롭으로 가장자리 wobble이 거의 사라진다 — [PetaPixel](https://petapixel.com/2026/09/15/canon-eos-r8-mark-ii-review-a-great-camera-in-a-polarizing-package/). 보행 전용 영상 평가는 검색에서 찾지 못했다.
- [리뷰] G9 II: Active I.S.가 보행과 패닝 같은 큰 움직임을 추가로 보정한다. 빠른 팬에서는 RS가 눈에 띈다 — [RTINGS G9 II](https://www.rtings.com/camera/reviews/panasonic/lumix-g9-ii)

### Inferences
- [추론] R8(초대)은 IBIS가 없어 보행 보정을 렌즈 IS와 Movie Digital IS(크롭)에 의존한다. R8 II는 IBIS + Coordinated Control로 바뀌어 이 구조적 약점이 사라졌다. 다만 Gyroflow를 쓸 수 없어 후처리 보정은 Optical correction(영상 기반)만 가능하다.
- [추론] 팬/틸트 자연스러움만 보면 "전자 보정 OFF + 물리 IBIS(+렌즈 OIS)"가 가장 안전하다. Panasonic의 揺り戻し 이슈는 리뷰가 전자 보정과 결합할 때로 특정했다.
- [추론] 가장 안정적인 워크플로는 Sony 바디(Standard IS) + Gyroflow 후처리다. 크롭과 부드러움을 편집 단계에서 조절할 수 있다. Canon 중에서는 R6 III만 이 경로가 가능하다(모든 IS를 꺼야 함).

### Gaps
- 영어권 리뷰(Gerald Undone, Kai W, Mark Holtze, CineD, DPReview 동영상)의 직접 비교 결과는 이번 호출 예산 안에서 확인하지 못했다.
- "Panasonic IBIS 팬 끝 float/drift"를 명시적으로 다룬 출처는 찾지 못했다. 가장 가까운 근거는 Video SALON의 "전자 보정 + 이동 시 揺り戻し"다.
- Sony Dynamic Active의 기종별 크롭률(약 1.1~1.3x 추정)과 a6700/FX30이 Dynamic Active를 지원하는지는 확인하지 못했다.
- Osmo Pocket 3 스펙, Nikon Z f/Z6III, Fujifilm X-S20/X-T5는 조사하지 못했다. Nikon은 자이로를 기록하지 않는다는 점만 확인했다([Gyroflow Nikon](https://docs.gyroflow.xyz/app/getting-started/supported-cameras/nikon)).
