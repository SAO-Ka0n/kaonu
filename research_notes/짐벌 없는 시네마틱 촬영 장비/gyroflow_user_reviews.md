# Gyroflow: user reviews of gyro-less (optical) stabilization and Canon EOS R8 use

Research date: 2026-11-10. Labels: **[USER]** = an independent user report, **[OFFICIAL]** = developer, docs or release notes, **[INFERENCE]** = my own reasoning.

**Access limits during this research (read this first):**
- Reddit (r/gyroflow, r/videography, r/canon, r/fpv) could not be reached by any route. The Reddit JSON API and old.reddit returned HTTP 403, WebSearch refuses the reddit.com domain, and the Xpoz social connector needs the user to sign in again.
- DPReview forums returned a CAPTCHA.
- The GitHub REST API is blocked in this session, so GitHub pages were read through the r.jina.ai reader.
- X/Twitter, YouTube comment threads and 価格.com were not reachable either.
- As a result, the "user evidence" here comes mainly from GitHub issues plus a few forum and blog pages. Reddit and YouTube sentiment is a gap, not a finding.

## 1. Does Gyroflow 1.7.0 exist, and when was it released? (This splits the evidence into pre- and post-1.7.0.)

### Takeaway
Yes. v1.7.0 was published on GitHub on **2026-11-07**, three days before this research. Its headline features are a new "Optical stabilization / Optical correction" algorithm and full Canon support for some models. The EOS R8 is not on that list. Almost no independent post-1.7.0 reviews exist yet.

### Cited Findings
- [OFFICIAL] Release timestamps from the rendered GitHub releases page:
  - v1.7.0: 2026-11-07T03:26Z
  - v1.6.3: 2025-09-04
  - v1.6.2: 2025-08-19
  - v1.6.1: 2025-04-07
  - v1.6.0: 2024-10-23
  - v1.5.4: 2023-11-01
  - Source: [GitHub releases](https://github.com/gyroflow/gyroflow/releases)
- [OFFICIAL] The v1.7.0 notes describe "Optical stabilization" as a "New algorithm for stabilization without motion data that's actually good. It produces similar results to gyro-based stabilization on most videos with good tracking points and good lens profile."
  - It is enabled in `Motion data -> Optical correction`.
  - "If you have a moving subject in frame, you can edit every tracked point and remove it from the solution. Valid lens profile is required."
  - The notes also claim it fixes "Sony with OSS" and "DJI with RockSteady" footage.
  - Source: [v1.7.0 release notes](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0)
- [OFFICIAL] v1.7.0 also adds:
  - "Optimal path" smoothing, which "never lags behind pans" and removes "much more shake than Default at the same zoom". This is relevant to walking and pan/tilt footage.
  - A new default autosync method, "Optical analysis".
  - Optional "GMFlow (AI)" tracking, described as "much slower" and needing a Vulkan or Metal GPU.
  - Source: [v1.7.0 release notes](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0)
- [OFFICIAL] v1.7.0 "Full support" for Canon covers only these bodies: "Canon C50, C80, C400, EOS R5 Mark II, EOS R6 Mark III and EOS R6 V (MP4/MXF) ... RF lenses only for now ... Turn the lens image stabilizer (IS) off: Gyroflow can't stabilize clips recorded with it, and warns about them." The EOS R8 and R8 Mark II are not listed. Source: [v1.7.0 release notes](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0)
- [OFFICIAL] Before 1.7, v1.5.4 (2023-11) had already added "a basic way to stabilize files that have no gyro data". That is the older optical-flow mode that the pre-1.7 user reports below refer to. Sources: [WebSearch summary of newreleases.io tracker](https://newreleases.io/project/github/gyroflow/gyroflow/release/v1.5.3); [commit "Add ability to use optical flow data as gyro data", 2023-10-17, cited in issue #45](https://github.com/gyroflow/gyroflow/issues/45)

### Inferences
- [INFERENCE] With a release only three days old, any "post-1.7.0" evidence is effectively limited to:
  - dev-build users in October 2026, before the final release;
  - the developer's own claims.

### Gaps
- I could not check the Reddit or Discord reaction in the first three days after release.

## 2. User reports on Gyroflow optical-flow (no-gyro) stabilization: post-1.7.0 vs earlier

### Takeaway
**Post-1.7.0 (including the October 2026 dev builds):**
- There is exactly one independent user report, from an FPV drone (DJI Avata 2) user on a dev build. It is positive with a caveat: "not as clean as the standard stab".
- There is one synthetic benchmark by a GitHub bounty contributor, which reports accurate measurement on ideal textured footage.
- I found **no independent walking or pan/tilt tests with a mirrorless camera, and no Canon R8 tests**, using 1.7.0.

**Pre-1.7.0:** the evidence is sparse and mostly negative:
- crashes on iPad;
- a user finding OpenShot's 2D stabilizer smoother and less distorted;
- a reported "default settings make shaking worse".

### Cited Findings: post-1.7.0 or 1.7 dev build
- [USER] GitHub #1268, opened 2026-10-25 by ianaell. Setup: Gyroflow v1.6.3, macOS on an M2 Pro, DJI Avata 2 (FPV, not handheld).
  - The gyro data dropped out mid-clip and "ruins the output", and manual keyframing could not fix it.
  - The developer pointed the user to the dev build: Motion data -> Optical correction -> "Ignore motion data from file" -> Analyze.
  - The user replied the same day: "it does a good job! I wouldn't say it is as clean as the standard stab but it's much better than with the bug I had", and later "The optical correction does look very good".
  - [OFFICIAL] The developer added: "when I tried optical correction on your file, it was perfect", and suggested resetting settings to their defaults.
  - Source: [Issue #1268](https://github.com/gyroflow/gyroflow/issues/1268)
- [USER/contributor, synthetic test] GitHub #45, comment of 2026-10-12 by morikotikk, a bounty contributor rather than an end user, run on master before the release.
  - Test clip: a synthetic 3840x2160/30fps clip with known roll shake, flat with rich texture, run through the optical-only path (KLT, default settings).
  - Measured orientation error was 0.21° rms.
  - Shake above 1 Hz went from 0.93° rms in to 0.023° rms out, about a 40x reduction.
  - Residual drift reached a maximum of 0.78° over 10 s.
  - The contributor's caveat: this is "ideal footage"; real-world gains in parallax, non-rigid scenes and rolling-shutter interplay are unverified.
  - Source: [Issue #45](https://github.com/gyroflow/gyroflow/issues/45)
- [OFFICIAL, limitations stated in the docs]
  - Tracking choices: "KLT (corners) is the most accurate where the image has detail. DIS (dense flow) also follows weak detail like sky, water or fog, but it's slower and loses fast motion more easily."
  - Correction choices: "Per row" removes jello within a frame, while "Per frame" suits global shutter cameras, large areas without detail, or an unknown rolling-shutter time.
  - Strength: a high strength value "follow[s] moving objects in the image more".
  - Moving things ("cars, people, water, propellers or on-screen graphics ... can pull the stabilization with them") must be removed by hand in the tracked-points editor.
  - Tracked points are not saved in project files.
  - Source: [Input Data docs](https://docs.gyroflow.xyz/app/advanced-usage/input-data)
- [OFFICIAL] The DJI docs page is more cautious about optical correction: results are "still not perfect, but the results are pretty good". Source: [DJI docs (via WebSearch summary)](https://docs.gyroflow.xyz/app/getting-started/supported-cameras/dji)

### Cited Findings: pre-1.7.0 (v1.5.x and v1.6.x "basic" optical flow)
- [USER] GitHub #792, 2024-02-07, Gyroflow 1.5.4 on iPad (iOS 16.5.1): "when trying to stabilise footage without gyro data on my iPad the app crashes around 50%". The issue was later closed after the developer engaged in May 2024. Source: [Issue #792](https://github.com/gyroflow/gyroflow/issues/792)
- [USER] GitHub #827, 2024-04-30, siefkenj: "I have some video without a lens profile and without gyro data. I find that OpenShot's 2d-only stabilization produces smoother and less-distorted results than Gyroflow's." Source: [Issue #827](https://github.com/gyroflow/gyroflow/issues/827)
- [USER, second-hand] In #45 (2026-10-12), a contributor quotes user ioctl-user saying that with optical-only mode, "default settings ... output video shaking can be even more than the input". The original comment is hidden among the thread's 55 collapsed items, so I could not see it directly. The same comment quotes the developer saying queued autosync for optical-only clips "was not implemented in queue". Source: [Issue #45](https://github.com/gyroflow/gyroflow/issues/45)
- [USER] #45, 2023-02-08, drewtato, on the vidstab alternative: "takes absolutely forever to filter the video, especially if it's high resolution". This is context on why users wanted optical stabilization inside Gyroflow. Source: [Issue #45](https://github.com/gyroflow/gyroflow/issues/45)
- [Third-party guide, not a user test] A 2026 FPV guide calls optical flow a fallback with "inconsistent" results, where frame-to-frame analysis "can drift on fast pans". This most likely describes the pre-1.7 mode. Source: [UAVMODEL blog](https://blog.uavmodel.com/gyroflow-stabilization-for-fpv-lens-profile-calibration-sync-points-and-export-settings-2026-guide/)
- [Forum, old] IntoFPV was searched; one thread summary says the early no-gyro mode was "slow, but may be workable for short clips on a powerful PC". I could not trace the exact post, so treat this as low confidence. Source: [IntoFPV forum search result](https://intofpv.com/t-gopro8-suddenly-missing-gyro-metadata)

### Inferences
- [INFERENCE] The only real user success report under 1.7 is FPV drone footage with gyro data that was broken mid-clip. That is a rigid camera with a wide lens and many tracking points, which differs from handheld walking with a telephoto or normal lens, people moving through the frame, and low-texture scenes. Walking and pan/tilt performance on a gyro-less mirrorless camera is **unverified by independent users**.
- [INFERENCE] The documented need to delete moving-subject tracks by hand means walking shots with passers-by may need manual cleanup per clip.
- [INFERENCE] The requirement for a valid lens profile adds friction for Canon RF or EF lenses without a community profile, because the user must calibrate first.

### Gaps
- There are no YouTube before/after videos of 1.7 optical stabilization that I could verify. The YouTube search pages and video content were not reachable through this toolchain.
- Japanese sources (note.com, Zenn, Qiita, 価格.com) returned nothing for "Gyroflow ジャイロなし" or "オプティカルフロー". I found no Japanese user reports.
- Real-world numbers on rendering speed, crop amount and night or low-light failure for 1.7 optical mode were not found.

## 3. Canon EOS R8 (and R8 Mark II) with Gyroflow: does gyro data work?

### Takeaway
I found **no evidence that the EOS R8 records gyro data that Gyroflow can read**, and no user R8 + Gyroflow tests at all. The official Canon support page lists:
- R6 Mark II: ❌
- R5 (original): ❌
- R5 Mark II, R6 Mark III, R6 V, C50, C80, C400: ✅

The R8 is from the same generation as the R6 II and is not listed. For an R8, the realistic routes are 1.7's Optical correction (gyro-less) or an external gyro logger.

### Cited Findings
- [OFFICIAL] The Gyroflow Canon docs page (last updated about 2026-10-25) reads: "Newer Canon mirrorless cameras are supported out of the box."
  - The model table marks EOS R6 Mark II ❌ / R6 Mark III ✅, R5 ❌ / R5 Mark II ✅, and R6 V ✅. The R8 is not mentioned.
  - "all internal stabilization in camera must be disabled. This includes Lens IS, Digital IS and IBIS."
  - "Canon's gyro data timing is not always 100% accurate. You may have to do an Auto Sync on some clips."
  - Automatic lens profiles only cover a short list of RF L, VCM, cinema and EF cinema lenses. Other lenses need a manual profile.
  - Source: [Gyroflow docs – Canon](https://docs.gyroflow.xyz/app/getting-started/supported-cameras/canon)
- [OFFICIAL] GitHub #1259 (2026-10-17), from an R5 II user asking about IBIS-aware stabilization like Sony's. The developer: "I asked them [Canon] to add that, but they were not particularly interested ... There's nothing Gyroflow can do without that data from Canon." So Canon IBIS-on footage cannot be compensated in Gyroflow. Source: [Issue #1259](https://github.com/gyroflow/gyroflow/issues/1259)
- [USER, unread] A DPReview thread titled "Gyro stabilisation with Gyroflow on recent EOS R models – a bit tricky so far" exists, but CAPTCHA blocked it. Per the search snippet:
  - it says the R6 III and R5 II save gyro data when IBIS/IS/EIS is off;
  - it says released v1.6.3 did not support Canon, so the nightly build was needed;
  - it does not name the R8.
  - Source: [DPReview forum](https://www.dpreview.com/forums/threads/gyro-stabilisation-with-gyroflow-on-recent-eos-r-models-a-bit-tricky-so-far.4828598/)
- [Background] The original EOS R8 has no IBIS and relies on lens IS ([gori.me](https://gori.me/?p=146332)). Per search snippets I did not verify, the EOS R8 Mark II adds 5-axis IBIS and its release date is 2026-10-29 ([gori.me](https://gori.me/?p=170204)).
- [Third-party, dated] A Filmora guide says Canon cameras usually don't record gyro data internally. This predates the 2026 Canon support. Source: [Filmora](https://filmora.wondershare.com/video-editing/gyroflow-stabilization.html)

### Inferences
- [INFERENCE] The R8 is unlikely to record gyro metadata, because the docs mark its sibling R6 Mark II ❌ and Canon's gyro recording appears only on bodies from 2024 onward. Even if it did, the docs require lens IS off. On the R8, which has no IBIS, lens IS is the only stabilization available, so turning it off leaves the raw footage fully unstabilized.
- [INFERENCE] The R8 Mark II is a 2026 body, so it might record motion data, but it is not on the v1.7.0 or docs support list as of 2026-11-10. This is unconfirmed.
- [INFERENCE] For R8 users, the practical Gyroflow path in v1.7.0 is Optical correction ("Ignore motion data") with a calibrated or community lens profile. No user has published results for that combination.

### Gaps
- No Reddit, YouTube, Japanese or Canon-community user report of an R8 or R8 Mark II with Gyroflow was found. The Canon Community threads require a login.
- I could not open an R8 sample file to check whether it contains any motion metadata.

## 4. Known bugs and limitations, and comparisons with alternatives (FCP, Resolve, Warp Stabilizer, IBIS)

### Takeaway
**Optical mode (official):**
- Documented limits: moving subjects pull the stabilization, DIS tracking loses fast motion, and low-texture areas are weak.
- Workarounds: per-row correction for jello, and manual track removal.

**Pre-1.7 user issues:** iPad crash, worse-than-input shake on default settings, and missing queue support.

**Comparisons:** independent comparisons of Gyroflow against FCP, Resolve or Warp Stabilizer on handheld walking footage are anecdotal and pre-date 1.7.

**IBIS/OIS on plus Gyroflow:** this is officially unsupported for Canon. Sony is the exception, because it records IBIS and OSS data.

### Cited Findings
- [OFFICIAL] Gyroflow requires in-camera stabilization off for gyro-based stabilization. On Canon, the app now warns about clips recorded with lens IS. Sources: [v1.7.0 notes](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0); [Canon docs](https://docs.gyroflow.xyz/app/getting-started/supported-cameras/canon)
- [USER] GitHub #851 (2024-06-27): a user explains that turning off OIS/IBIS for Gyroflow "makes the unprocessed footage shakier", which leads to a narrower FOV, lower resolution and residual motion blur after stabilization.
  - [OFFICIAL] The developer's reply: "The only way is for the camera to record how the OIS element was moved, which Sony does, and that is now supported", and optical stabilization "will be able to add the optical stabilization on top of gyro stabilization".
  - Source: [Issue #851](https://github.com/gyroflow/gyroflow/issues/851)
- [OFFICIAL] The v1.7.0 notes claim Optical correction fixes "Sony with OSS" and "DJI with RockSteady" footage, meaning footage already stabilized in camera. I found no independent user verification. Source: [v1.7.0 notes](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0)
- [USER] GitHub #1219 (2026-09-09, v1.6.3, Sony A6700 with SteadyShot off): roll was not stabilized and autosync with an external log ±80 ms off "barely ever works". After the user reset settings to their defaults, they said "Stabilization seems okay now" but the gyro-vs-optical estimate was "still off". This shows settings and preset pitfalls before 1.7. Source: [Issue #1219](https://github.com/gyroflow/gyroflow/issues/1219)
- [Pre-1.7 comparison] A 4K Shooters comparison (2020, Sony a7C/a7III) tested gyro, IBIS and Warp Stabilizer. Its characterization: Warp is "a guessing game" that "locks onto the wrong object in the frame at times", while gyro stabilization "is based on hard data". Source: [4kshooters](https://4kshooters.net/2020/11/24/sony-a7c-and-a7iii-gyro-vs-ibis-vs-warp-stabilizer)
- [Comparison video, content not verified] Syrp Lab tested Warp Stabilizer, gyro-assisted methods, gimbals and IBIS ([PetaPixel 2022](https://petapixel.com/2022/08/04/testing-every-type-of-stabilization-technique-to-pick-a-winner); [DIYPhotography](https://www.diyphotography.net/these-guys-tested-every-video-stabilizer-so-you-dont-have-to-but-you-probably-still-should/)). I could not extract walking-specific results.
- [Background, not Gyroflow] Digital Camera World describes digital stabilization stacked on IBIS making frame edges "wave around like jelly". This is in-camera EIS, not Gyroflow, but it illustrates the warping that stacked stabilization can cause. Source: [Digital Camera World](https://digitalcameraworld.com/news/why-digital-image-stabilization-is-better-than-you-think-until-this-happens)

### Inferences
- [INFERENCE] I found no user head-to-head of Gyroflow 1.7 Optical correction against FCP (InertiaCam/SmoothCam), Resolve or Warp Stabilizer. Any claim that 1.7 optical stabilization beats them on walking footage is currently a developer claim only.
- [INFERENCE] The case for stacking IBIS or lens IS with 1.7 optical-only mode is plausible: optical mode measures the image motion that actually occurred, which already includes the IS correction. But neither the docs nor any user test confirms it for Canon. The Canon docs' "must be disabled" applies to gyro-data mode; for optical-only mode it is unclear.

### Gaps
- I found no user reports quantifying 1.7 optical-mode render or analysis speed, crop percentage, night or low-texture failure rate, or crash frequency.
- No FCP, Resolve or Premiere vs Gyroflow comparison on gyro-less mirrorless walking or pan footage could be located; the reachable search results came up empty.
- Reddit threads, the main expected source of comparison anecdotes, were inaccessible (HTTP 403). This is the biggest hole in this research.
