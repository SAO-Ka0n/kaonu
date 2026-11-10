# Gyroflow 1.7.0 and gyro-less (optical) stabilization: official sources

Method note: GitHub REST API was blocked in this session. Release notes were read from the GitHub releases page (via r.jina.ai reader). Tag dates and source code were read from a shallow `git clone` of github.com/gyroflow/gyroflow (tag v1.7.0, master HEAD 69c4605 of 2026-11-10) and github.com/gyroflow/gyroflow-plugins. Docs were read from docs.gyroflow.xyz. "Official" = the release notes, docs, UI strings or source comments written by the Gyroflow project. "Inference" = my reasoning. No independent performance tests were found. Every quality claim below is the developer's own statement.

## 1. Does Gyroflow v1.7.0 exist? Release date and changelog

### Takeaway
Yes. v1.7.0 is a real, final (non-beta) release. Its git tag was created 2026-11-07 00:36 UTC (01:36 CET) by AdrianEddy, about 14 months after v1.6.3 (2025-09-04). As of 2026-11-10 it is the latest tag; no v1.7.x patch tag exists yet.

### Cited Findings
- The releases page lists "v1.7.0" at the top, above v1.6.3, v1.6.2 and others. — [GitHub releases](https://github.com/gyroflow/gyroflow/releases)
- Tag object `v1.7.0` (commit eb695f0, message "Release v1.7.0"). Tagger AdrianEddy, timestamp 1794011818 = 2026-11-07 00:36:58 UTC. Commit date 2026-11-07T01:36:58+01:00. — [git tag v1.7.0](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0) (checked with `git ls-remote --tags` and `git cat-file -p v1.7.0`)
- Previous release: v1.6.3, tagged 2025-09-04 13:29 UTC. — [GitHub releases](https://github.com/gyroflow/gyroflow/releases)
- `git ls-remote --tags origin 'v1.7*'` returns only v1.7.0. Master already has a later commit, "Fix rendering to NAS. Fixes #1291" (2026-11-10). — [gyroflow repo](https://github.com/gyroflow/gyroflow)
- Headline items in the v1.7.0 notes, quoted from [the release](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0):
  - "**Optical stabilization** - New algorithm for stabilization without motion data that's actually good. It produces similar results to gyro-based stabilization on most videos with good tracking points and good lens profile. Enable in `Motion data -> Optical correction`. This fixes all O4 issues, vibrations, bad gyro, O4 Lite, DJI Neo shakes, Hero 7 on FPV, DJI with RockSteady, Sony with OSS etc. If you have a moving subject in frame, you can edit every tracked point and remove it from the solution. Valid lens profile is required."
  - "**New 'Optimal path' smoothing** - plans the camera path for the whole clip at once: it removes much more shake than 'Default' at the same zoom, never lags behind pans, and keeps the frame within the zoom limit."
  - "**New autosync method 'Optical analysis', now the default**." The older methods are still under `Synchronization -> Advanced -> Offset method`. The previous default, rs-sync, moved there too.
  - Also new: "All Sony issues have been fixed, including Dynamic Active support", Sony lens breathing compensation, Focal length stabilization, a Manual zoom level for Static zoom, new horizon lock options, reworked lens math, Output projection, AV1 export, Gyroflow Protobuf ("an open format for embedding motion data, lens and IBIS/OIS info"), and "GMFlow (AI)" optical flow.
  - Improved autosync with the DIS method. "Autosync on a file without motion data now runs the optical analysis."
  - New cameras: Canon C50/C80/C400/R5 II/R6 III/R6 V, Z CAM Mark II, XTRA Edge, HOVERAir, plus others.
  - CLI: added `--optical-correction`, `--ignore-file-motion`, `--optical-per-frame` and `--optical-tracking` (`klt`/`dis`/`gmflow`).
  - Plugins: Shotcut support and many OpenFX/Adobe fixes.

### Inferences
- 1.7.0 shipped three days before today (2026-11-10). Expect early bugs; a 1.7.1 is likely soon, given the post-release fix commit already on master.

### Gaps
- The exact GitHub "published_at" timestamp could not be read (API blocked). The tag date is used as a proxy and normally matches within hours.
- No Discord announcement was checked.

## 2. Gyro-less stabilization: official feature name and when it was introduced

### Takeaway
Yes, since 1.7.0 Gyroflow can stabilize footage with no motion data, using image analysis alone. The official UI name is **"Optical correction"** (Motion data panel), run with the **Analyze** button. The release notes call it "Optical stabilization", and the source calls it "Analyze image optically". To ignore the file's gyro data entirely, the option is **"Ignore motion data from the file"**. Before 1.7.0, optical flow in Gyroflow was used only for gyro-to-video synchronization, not for stabilization.

### Cited Findings
- Docs, Optical correction: "Since Gyroflow 1.7.0, Gyroflow can measure the camera motion directly from the video. This lets you: stabilize footage that has no motion data at all, [and] correct bad motion data wherever the image disagrees with it, like vibrations picked up by a hard-mounted FPV camera. To use it, enable **Optical correction** in the Motion data panel and click **Analyze**. Only the trim range is analyzed." — [docs: Input data -> Optical correction](https://docs.gyroflow.xyz/app/advanced-usage/input-data#optical-correction)
- "On a file without motion data, **Auto sync** runs this analysis as well." — [docs](https://docs.gyroflow.xyz/app/advanced-usage/input-data#optical-correction)
- UI tooltip for "Ignore motion data from the file": "Measure all of the motion from the video instead of correcting the motion data, when it's too broken to correct." — [MotionData.qml](https://github.com/gyroflow/gyroflow/blob/master/src/ui/menu/MotionData.qml)
- Source for the no-gyro case (`synchronization/optical_motion/odometry.rs`): "The camera's rotation between two frames from the image alone, for files without motion data." It estimates rotation together with translation and per-point inverse depth with a filter (one Gauss-Newton solve per frame pair). The stated reason is that "a rotation-only fit takes the parallax of the camera's own translation for rotation: a drone flying forward over the ground seems to pitch". The per-frame rotations are chained into a `video_base` orientation, densified to 1 kHz for the renderer. — [odometry.rs](https://github.com/gyroflow/gyroflow/blob/master/src/core/synchronization/optical_motion/odometry.rs), [optical_correction.rs](https://github.com/gyroflow/gyroflow/blob/master/src/core/gyro_source/optical_correction.rs)
- Source for the with-gyro case (`optical_motion/mod.rs`): every frame is tracked with KLT persistent tracks. The quaternions predict each point's position in the next frame, "rolling shutter included, each point at its own row's time". A temporal high-pass of the residuals isolates the rotation error from parallax, and a spline correction δ(t) is fitted (`q' = q * exp(δ(t))`). "The quaternions stay in charge of the slow motion (the image's own estimate of it would drift, and mixes rotation up with translation)". — [optical_motion/mod.rs](https://github.com/gyroflow/gyroflow/blob/master/src/core/synchronization/optical_motion/mod.rs)
- The release notes list cameras with no motion data, e.g. Nikon N-RAW, as "Playback only - no motion data in the file, use an external gyro or Optical correction". — [v1.7.0 notes](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0)

### Inferences
- Optical correction has two modes:
  - **Correction mode**: gyro plus image. The gyro holds the slow motion and the image fixes fast errors.
  - **Pure optical mode**: no gyro, or "Ignore motion data". The whole camera path comes from visual odometry.
  - The source itself says pure image estimates "drift", so pure optical mode should be expected to drift slowly over long clips. For stabilization the low-frequency path is smoothed away anyway, but the horizon lock has no gravity (accelerometer) reference. Not tested.

### Gaps
- No official statement says whether horizon lock works meaningfully without an accelerometer in pure optical mode.

## 3. KLT, DIS, GMFlow, Optical analysis sync, and the smoothing algorithms

### Takeaway
Optical flow plays two separate roles in Gyroflow:
- **Synchronization**: aligning the gyro timeline to the video. Settings live in the Synchronization panel: Optical flow method DIS / PyrLK / AKAZE / GMFlow, plus Pose method and Offset method. The new default offset method in 1.7.0 is "Optical analysis".
- **Motion estimation for stabilization**: Optical correction. Its Tracking choices are KLT (default), DIS and GMFlow.
"Optimal path" is a smoothing algorithm. It runs after the motion is known, whichever way it was measured.

### Cited Findings
- **Optical correction Tracking options**:
  - KLT: "Pyramidal Lucas-Kanade at corners: the most accurate where there's texture to track" (default).
  - DIS: "Dense optical flow (DIS), sampled at the same points: a flow everywhere, also where corners are few and weak (sky, water, fog), at a few times the time".
  - GMFlow: "Dense optical flow from gmflow (AI, Unimatch)... holds up through large motion and weak detail, but coarse (the model sees 576x320) and slow".
  — [optical_correction.rs, `TrackingMethod`](https://github.com/gyroflow/gyroflow/blob/master/src/core/gyro_source/optical_correction.rs)
- Docs wording: "**KLT (corners)** is the most accurate where the image has detail. **DIS (dense flow)** also follows weak detail like sky, water or fog, but it's slower and loses fast motion more easily." — [docs](https://docs.gyroflow.xyz/app/advanced-usage/input-data#optical-correction)
- GMFlow "needs a GPU with Vulkan (Metal on Apple)", downloads a model of about 30 MB on first use, and is "Not available on Android and iOS". — [v1.7.0 notes](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0)
- **Correction: Per row vs Per frame**: "**Per row** also removes vibration within a frame (jello). **Per frame** suits global shutter cameras, frames with large areas without detail, or an unknown rolling shutter time." — [docs](https://docs.gyroflow.xyz/app/advanced-usage/input-data#optical-correction)
- **Strength** (default 0.5): "Low values only correct small, fast errors like vibration. High values also correct large and long errors like gyro glitches, but follow moving objects in the image more. It's shown only when there's motion data to correct." — [docs](https://docs.gyroflow.xyz/app/advanced-usage/input-data#optical-correction); default 0.5 per [source](https://github.com/gyroflow/gyroflow/blob/master/src/core/gyro_source/optical_correction.rs)
- **Synchronization (gyro to video offset)**:
  - Optical flow method: OpenCV (DIS) "dense optical flow", OpenCV (PyrLK) "tracks individual corner points", AKAZE "matches features... much slower".
  - Pose method: findEssentialMat (default), Almeida, EightPoint, findHomography.
  - Offset methods: rs-sync, Visual features, Essential matrix.
  — [docs: Synchronization](https://docs.gyroflow.xyz/app/advanced-usage/synchronization)
- The docs sync page still says rs-sync is the "default". The 1.7.0 notes say "Optical analysis" is now the default and rs-sync moved to Advanced. The docs page lags the release on this point. — [docs](https://docs.gyroflow.xyz/app/advanced-usage/synchronization) vs [v1.7.0 notes](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0)
- **Smoothing algorithms** listed in the docs:
  - No smoothing ("Lens and rolling shutter correction still apply")
  - Default ("slow motion is smoothed a lot, while fast motion... is followed more closely")
  - Plain 3D
  - Fixed camera
  — [docs: Stabilization](https://docs.gyroflow.xyz/app/advanced-usage/stabilization)
  - The docs page does not yet list Optimal path. That comes from the release notes and source: "'Optimal path': the virtual camera's path solved as an optimization over the whole clip..., smoothed as far as the crop at the zoom limit allows at every frame." — [smoothing/optimal/mod.rs](https://github.com/gyroflow/gyroflow/blob/master/src/core/smoothing/optimal/mod.rs)
- Optimal path's crop constraint leaves out "the camera's own IBIS/OIS shifts, mesh correction and the breathing's differences between the rows of a frame"; "the zoom limit's iterations still catch what's left". — [smoothing/optimal/crop.rs](https://github.com/gyroflow/gyroflow/blob/master/src/core/smoothing/optimal/crop.rs)

### Inferences
- Choosing a tracker: KLT for textured scenes, DIS for sky, water or fog with slow motion, GMFlow for fast motion with weak detail when a GPU is available.
- Optimal path is a whole-clip (non-causal) optimizer. It suits finished clips in the app, which it was designed for. Its fit for the plugins was not checked.

### Gaps
- No official benchmarks compare KLT, DIS and GMFlow accuracy.
- Not verified whether Optimal path is exposed in the OpenFX/Adobe/FCP plugins.

## 4. Is a lens profile required for gyro-less mode? Effect of lens distortion

### Takeaway
Yes, officially: "Valid lens profile is required" for Optical stabilization (1.7.0 release notes). The analysis maps each tracked pixel to a 3D ray through the lens model and the rolling-shutter timing. A wrong lens profile, sync or readout time therefore biases the measured rotation, and changing any of them makes the analysis stale.

### Cited Findings
- "It produces similar results to gyro-based stabilization on most videos with good tracking points and good lens profile... Valid lens profile is required." — [v1.7.0 notes](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0)
- The correction is measured "against one particular picture of them - which pixel was read out when, and which ray it came from: another sync, lens profile or rolling shutter time makes it stale too". — [optical_correction.rs](https://github.com/gyroflow/gyroflow/blob/master/src/core/gyro_source/optical_correction.rs)
- "If you change the motion data, synchronization, lens profile or frame timing after the analysis, the correction is out of date and isn't applied until you analyze again." — [docs](https://docs.gyroflow.xyz/app/advanced-usage/input-data#optical-correction)
- The tracked points are undistorted with `undistort_points_with_rolling_shutter`, which uses the lens model and readout timing. — [optical_motion/mod.rs](https://github.com/gyroflow/gyroflow/blob/master/src/core/synchronization/optical_motion/mod.rs)
- New lens option in 1.7.0: "No distortion, focal length only" for already undistorted videos, using a 35 mm equivalent focal length you enter. Canon C50/C80/C400/R5 II/R6 III/R6 V record per-frame focal length, "so no lens profile is needed". — [v1.7.0 notes](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0)

### Inferences
- Without a correct focal length, a pixel shift cannot be converted to an angle. A wrong focal length scales every measured rotation, so stabilization over- or under-corrects. Uncorrected distortion makes the same rotation move edge pixels differently from centre pixels, which the rotation-plus-translation fit misreads as parallax or extra rotation.
- For a camera with no Gyroflow lens profile, the practical options are:
  - calibrate one with the built-in Calibrator (1.7.0 adds a "Gyroflow" calibration method), or
  - for a near-rectilinear lens, use "No distortion, focal length only".

### Gaps
- No quantitative official data on how much a lens-profile error degrades optical stabilization.

## 5. Pros and cons vs gyro-based stabilization

### Takeaway
Official position: optical correction gives "similar results to gyro-based stabilization on most videos with good tracking points and good lens profile". The source code states its structural limits: image-only motion drifts, mixes rotation with translation, is fooled by moving objects, and needs texture and sharp frames. Gyro remains the preferred base where good gyro data exists; optical correction mainly patches bad gyro or covers no-gyro cameras.

### Cited Findings
- Official pro (developer claim, not independently validated): "similar results to gyro-based stabilization on most videos with good tracking points and good lens profile"; fixes "O4 issues, vibrations, bad gyro, O4 Lite, DJI Neo shakes, Hero 7 on FPV, DJI with RockSteady, Sony with OSS". — [v1.7.0 notes](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0)
- Official limit, drift and translation: "the image's own estimate of [slow motion] would drift, and mixes rotation up with translation". — [optical_motion/mod.rs](https://github.com/gyroflow/gyroflow/blob/master/src/core/synchronization/optical_motion/mod.rs)
- Official limit, moving subjects: "If the analysis picked up things that move on their own, like cars, people, water, propellers or on-screen graphics, they can pull the stabilization with them." Users can remove such tracks in the Tracked points editor. — [docs](https://docs.gyroflow.xyz/app/advanced-usage/input-data#tracked-points-editor)
- Official limit, lost tracks: short tracks are discarded, "mostly points lost again right away, to motion blur, an occlusion, the edge of the frame". — [optical_motion/mod.rs](https://github.com/gyroflow/gyroflow/blob/master/src/core/synchronization/optical_motion/mod.rs)
- Official limit, processing: only the trim range is analyzed. The tracked points don't persist in the project file, only the correction does. — [docs](https://docs.gyroflow.xyz/app/advanced-usage/input-data#optical-correction)
- Plugin limitation: "it's practically impossible to recreate all tools it offers (for example synchronization with optical flow) inside the plugin UI". The workflow is to do the analysis in the app and export a project file. — [docs: General plugin workflow](https://docs.gyroflow.xyz/app/video-editor-plugins/general-plugin-workflow)

### Inferences
- **Gyro advantages**:
  - It works in low light, low texture and heavy blur, where the image fails.
  - It measures at high rate (hundreds of Hz to kHz) independently of image content.
  - It has an accelerometer for horizon reference.
  - It is not fooled by moving subjects.
  - Analysis is quick; only sync is needed.
- **Optical advantages**:
  - It works on any camera, including the many cinema and mirrorless bodies with no gyro metadata.
  - It can correct gyro vibration aliasing.
  - It can also measure motion that gyro-based correction misses, such as mechanical OIS or IBIS movement that isn't recorded (Inference: the image shows the actual result).
- Optical correction is better seen as a strong fallback than as a full equal to gyro.

### Gaps
- No independent third-party comparison of 1.7.0 optical vs gyro results was found.

## 6. Shutter speed, motion blur and rolling shutter

### Takeaway
Official guidance: avoid motion blur for any electronic or post stabilization. Use a fast shutter (90° or 45° rather than 180°), avoid ND where possible, and add motion blur in post. Rolling-shutter correction needs the correct "Frame readout time". Optical correction "Per row" uses it to remove jello. "Per frame" is the fallback when readout time is unknown or the sensor is global shutter.

### Cited Findings
- "For any electronic stabilization it's best to avoid motion blur. This means that you have to use high shutter speed and avoid ND filters if the lighting conditions allow it." — [docs: Common filming tips](https://docs.gyroflow.xyz/app/getting-started/common-filming-tips-and-issues)
- Blur keeps the original motion direction after stabilization, which "creates an ugly-looking effect". You can add motion blur in post, e.g. with ReelSmart Motion Blur, Resolve, or AE Pixel Motion Blur. — [same page](https://docs.gyroflow.xyz/app/getting-started/common-filming-tips-and-issues)
- "[The 180° rule] doesn't work when using any kind of digital stabilization... Using 90° or even 45° shutter will be much better choice if you want to use any post-stabilization." 180° is fine when the camera is physically stabilized and only minor correction is needed. — [same page](https://docs.gyroflow.xyz/app/getting-started/common-filming-tips-and-issues)
- Rolling shutter: "Gyroflow needs to know the **Frame readout time**"; some cameras have it built in, GoPro corrects it in camera, and global shutter cameras (e.g. RED KOMODO) don't need it. — [docs: Basic stabilization](https://docs.gyroflow.xyz/app/getting-started/basic-usage/stabilization#rolling-shutter-correction)
- Calibration footage should be sharp: "Use high shutter speed... Avoid motion blur". — [Calibrator.qml](https://github.com/gyroflow/gyroflow/blob/master/src/ui/Calibrator.qml)

### Inferences
- Motion blur hurts optical mode twice: it causes the visual artefact after stabilization, and it makes KLT lose tracks (source: points are "lost again right away, to motion blur"). So a fast shutter matters even more without gyro than with it.

### Gaps
- The filming-tips page is old ("Last updated 3 years ago"). No 1.7.0-specific shutter guidance for optical mode exists.

## 7. Final Cut Pro integration

### Takeaway
The official plugins repo covers OpenFX (Resolve, SCRATCH, Nuke, Vegas, etc.), Adobe (Premiere Pro, After Effects), frei0r and Shotcut (new in 1.7.0). Final Cut Pro is supported through **Gyroflow Toolbox**, an FxPlug4 plugin. It is maintained in an external repo (latenitefilms/GyroflowToolbox), sold on the Mac App Store for USD 9.99, and open source. The alternative workflow is to render from the Gyroflow app (e.g. ProRes) and import that file into FCP.

### Cited Findings
- "This repository contains the source code of Gyroflow video editor plugins. This includes OpenFX, Adobe and frei0r. Final Cut Pro plugin is hosted in an external repository (latenitefilms/GyroflowToolbox)." The supported-apps table lists "Final Cut Pro | FxPlug4 | gyroflowtoolbox.io". — [gyroflow-plugins README](https://github.com/gyroflow/gyroflow-plugins)
- "The Final Cut Pro plugin, called Gyroflow Toolbox is available on the Mac App Store as paid product (to cover support costs), however you can also build it from source." — [gyroflow-plugins README](https://github.com/gyroflow/gyroflow-plugins)
- Docs:
  - Gyroflow Toolbox imports Gyroflow projects so "you don't have to export a ProRes file (for example), from Gyroflow - avoiding any round-tripping".
  - It is "powered by the same Gyroflow Core Engine".
  - Price: "a one-time payment of USD$9.99".
  - Can be combined with BRAW Toolbox.
  - Constraint: "You should always put the Gyroflow Toolbox effect on a clip inside a Compound Clip... the clip cannot be trimmed. Due to limitations in Final Cut Pro's FxPlug4 API - we currently can't determine the source start timecode of a clip."
  — [docs: Final Cut Pro X](https://docs.gyroflow.xyz/app/video-editor-plugins/final-cut-pro-x)
- 1.7.0 plugin changes cover OpenFX/Adobe/frei0r/Shotcut. The release notes do not mention Final Cut Pro. — [v1.7.0 notes](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0)
- General workflow: for footage needing sync or a manually chosen lens profile, do everything in the app, then "export a project file which includes all your parameters and gyro data" (Ctrl+S) and load it in the plugin. — [docs: General plugin workflow](https://docs.gyroflow.xyz/app/video-editor-plugins/general-plugin-workflow)

### Inferences
- For gyro-less footage in FCP:
  - Run Optical correction in the Gyroflow app, then either render ProRes (safest), or export a .gyroflow project and load it in Gyroflow Toolbox.
  - Whether a project carrying an optical `video_base` loads correctly in Gyroflow Toolbox depends on the Toolbox having updated to the 1.7.0 core. Unverified; it is a third-party release cycle.

### Gaps
- The GyroflowToolbox repo and changelog were not checked, so its 1.7.0-core support status is unknown.

## 8. IBIS/OIS and in-camera stabilization compatibility

### Takeaway
Gyro mode and optical mode have different constraints.
- **Gyro mode** works with IBIS or OIS on only when the camera records the stabilizer's position. Officially this is Sony: it records IBIS and OIS data, and Active and Dynamic Active are supported, the latter since 1.7.0. Canon lens IS must be OFF; Gyroflow warns and can't stabilize such clips. Otherwise the safe default is all in-camera stabilization OFF.
- **Optical mode** measures the motion that is actually visible in the frame, so it is in principle less sensitive to unrecorded stabilizer motion. The 1.7.0 notes say it fixes "Sony with OSS" and "DJI with RockSteady". There is no official blanket statement that IBIS + OIS + optical, or digital IS + optical, is supported.

### Cited Findings
- Sony: "Gyroflow reads all of the stabilization metadata recorded by the camera, which includes IBIS and OIS data. Therefore, you **can record with IBIS and OIS enabled.** The **Active** and **Dynamic Active** modes are supported as well (Dynamic Active since Gyroflow 1.7.0). The best option is to use **Standard** stabilization in camera (if your model has IBIS) and add Gyroflow on top of that, because Active and Dynamic Active also crop the image in camera." OSS lenses must be on Sony's compatibility list. — [docs: Sony](https://docs.gyroflow.xyz/app/getting-started/supported-cameras/sony)
- Source: Sony parser handles "Sensor (IBIS) or lens (OIS) stabilizer position samples, with their own timing" and the capture area being off-centre "(dynamic EIS)". The renderer applies per-row "sensor and lens shift" and handles "a moving EIS crop". — [sony.rs](https://github.com/gyroflow/gyroflow/blob/master/src/core/gyro_source/sony.rs), [frame_transform.rs](https://github.com/gyroflow/gyroflow/blob/master/src/core/stabilization/frame_transform.rs)
- Canon: "Turn the lens image stabilizer (IS) off: Gyroflow can't stabilize clips recorded with it, and warns about them." The UI message reads "This video was recorded with the lens image stabilizer (IS) on, which Gyroflow doesn't support for Canon cameras." — [v1.7.0 notes](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0), [VideoArea.qml](https://github.com/gyroflow/gyroflow/blob/master/src/ui/VideoArea.qml), [canon.rs `lens_stabilizer_on`](https://github.com/gyroflow/gyroflow/blob/master/src/core/gyro_source/canon.rs)
- Optical correction fixes "DJI with RockSteady" and "Sony with OSS". — [v1.7.0 notes](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0)
- Gyroflow Protobuf (1.7.0) is an open format for embedding "motion data, lens and IBIS/OIS info". — [v1.7.0 notes](https://github.com/gyroflow/gyroflow/releases/tag/v1.7.0)
- In the source, only Sony (and generic file_metadata/Protobuf) carry IBIS/OIS handling. A `grep` for ibis/ois matched sony.rs, mod.rs, file_metadata.rs and the stabilization files. — [gyroflow src/core](https://github.com/gyroflow/gyroflow/tree/master/src/core)

Scenario matrix. "Official" means stated in docs, release notes or source; everything else is inference.

| # | Setup | Status |
|---|---|---|
| 1 | IBIS OFF + lens IS OFF + gyro | Officially the standard, safe case for all gyro-supported cameras. |
| 2 | IBIS ON + lens IS OFF + gyro | Officially supported on Sony (IBIS recorded; "Standard" mode recommended). On bodies that don't record IBIS position (inference: most non-Sony bodies), the gyro measures body motion while the sensor has already moved, so results are wrong or double-corrected. Not confirmed for Panasonic/Nikon/Fujifilm in docs. |
| 3 | IBIS ON + lens IS ON + gyro | Officially supported on Sony with lenses on Sony's OSS compatibility list. Officially NOT supported on Canon (lens IS must be off). Other brands not documented. |
| 4 | IBIS ON + lens IS ON + optical flow | No official blanket rule. The notes say optical correction fixes "Sony with OSS" (likely correcting a gyro base). Inference: in pure optical mode the image shows the net result of IBIS/OIS, so stabilizer motion is measured as camera motion. Two risks: IBIS shift is a translation, which the rotation model may misread, and OIS shifts the optical centre away from the lens profile's assumption, so accuracy may drop. Unverified. |
| 5 | In-camera digital IS ON + optical flow | No official statement for pure optical mode. Official related points: the release notes say it fixes "DJI with RockSteady", and Sony Active/Dynamic Active crop is handled only via recorded metadata. Inference: a digital IS crop changes the effective focal length and centre, and per-frame warping breaks the lens model the optical analysis relies on. Expect worse results and avoid if possible. In gyro mode, digital IS without recorded crop metadata breaks the gyro-to-image mapping. |

### Inferences
- Without Sony-style metadata, the recommendation for either mode is all in-camera stabilization OFF and a fast shutter. This is the conservative reading of the Canon warning and the "lens profile required" rule.

### Gaps
- No docs pages for Panasonic, Nikon or Fujifilm IBIS behaviour were checked. Whether those bodies record IBIS data usable by Gyroflow is unverified (only the Sony and Canon pages/source were read).
- No official statement on optical mode with IBIS/OIS/digital IS active in general, beyond the release-note mentions of "Sony with OSS" and "DJI with RockSteady".
