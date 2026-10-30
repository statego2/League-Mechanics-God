# League Mechanics God

An original, lightweight **browser-based LoL-style mechanics trainer**. No Unity, build step, backend, or install required.

## Play

Open `index.html` from a local web server:

```bash
git clone https://github.com/statego2/League-Mechanics-God.git
cd League-Mechanics-God
python3 -m http.server 8080
```

Visit **http://localhost:8080**.

For a public URL, enable **GitHub Pages** in the repository Settings → Pages → Deploy from a branch → main / (root). Your URL should then be **https://statego2.github.io/League-Mechanics-God/** after GitHub publishes it. Do not assume Pages is enabled until verified.

## Modes

- **Dodge Trial:** survive 60 seconds of enemy skillshots. Track damage and dodges.
- **Kite Arena:** defeat 10 enemies using movement, autos and abilities.

## Controls

| Input | Action |
|---|---|
| Right mouse button | Move; click enemy to attack |
| A, then left-click | Attack move toward cursor / nearest target |
| Left-click enemy | Auto attack (when in range) |
| Q | Bolt |
| W | Dash |
| E | Pulse |
| R | Volley |
| F | Flash |
| P or Escape | Pause |
| Restart button | Restart current mode |

## Implementation

Vanilla HTML5 Canvas + JavaScript + CSS, no third-party libraries and no copied game assets. This is a first **alpha** playable prototype. It is not yet equivalent to the attack timing, animation states, exact damage or collision rules of League of Legends.

## Next improvements

Attack-move input refinement; projectile dodge feedback; audio; settings; difficulty curve; high scores; mobile support; accessibility; deterministic gameplay tests.

Independent fan-made practice project, **not affiliated with or endorsed by Riot Games**.
