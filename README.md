# Project Duel

Complete static website, with all 47 card illustrations. No build step or npm installation is needed.

## Run locally

Extract the ZIP. Open a terminal in this folder and run:

```sh
python -m http.server 8000
```

On systems that use python3, run `python3 -m http.server 8000` instead.
Open http://localhost:8000 in your browser. Keep the terminal running while using the site.

On Windows you can also double-click START-WINDOWS.bat, then open that address.

## Upload to GitHub

Create a repository and upload all the extracted files and the art folder, preserving this structure. Upload the contents, not the ZIP itself. The index.html file should be at the repository root.

To host the website, enable GitHub Pages for your repository and select the branch and root folder containing index.html as its source. All asset paths are relative, so repository Pages URLs are supported.

## Your projects and backups

Projects are saved in your browser's local storage. They are not synced through GitHub. Export a backup using the existing site's Backup controls and import it in your local or GitHub-hosted copy to transfer your progress. Different website addresses and browsers each have separate saved data.

## Files

- index.html: website entry point
- style.css: battlefield and card styling
- app.js: project tracker and battle logic
- art-catalog.js: artwork catalog
- art/: all 47 illustrations and artwork prompts

This export includes the site's editable source. Card attack is generated when first placed. An internet connection may be used for Google Fonts; system fonts are used if unavailable.
