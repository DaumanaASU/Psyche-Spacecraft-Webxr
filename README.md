# Psyche - WebXR for Public Engagement

This project was created in collaboration with NASA and ASU's Psyche Mission. The aim is to create engaging WebXR experiences to inform the public about key details of the mission.

Project Sponsor: Dr. Cassie Bowman.

## Included Experiences
 - [Psyche To Scale](PsycheToScale)
---

# Technical Info
## Creating using the Psyche To Scale template
If you want to create your own experience using the same template as the Psyche To Scale experience, it is really easy!

You'll want to copy all of the documents within the Psyche To Scale folder first. Within the app.js and app_inline.js files, you'll see what you need to change for your own experience at the top of the file. This includes the .glb file, animation keyframe timings, and the text for the information panels.

It will look something like this:

```js
// Change this to your experience's glb file
var glbFilePath = '../assets/PsycheToScale.glb';
// Change these to your model's animation keyframes
var stops = [60/24, 115/24, 160/24];
// these are the titles of your modal panels, in order.
var titles = ["THE SPACECRAFT", "BUS (BODY) SIZE", "SPACECRAFT SIZE"];
// descriptions of modal panels in order
var descriptions = 
  [
    "The Psyche spacecraft is comprised of the bus (body), two solar arrays in a cross formation, and the instrument payload.",
    "The bus or \"body\" of the spacecraft is slightly bigger than a Smart Car and about as tall as a regulation basketball hoop.",
    "The Psyche spacecraft (including the solar panels) is about the size of a singles tennis court."
  ];
// set this to the entire length of your animation
var animationLength = 160/24;
```

### Creating your own animated model
I used Blender to create the animation for the Psyche To Scale experience. It seems intimidating at first, but it is pretty easy to use once you get past the initial learning curve. You can see the Blender source file [here](/assets/PsycheToScale.blend). There is a great Blender animation tutorial [here](https://www.youtube.com/watch?v=GGp4ytnxJJ0). Once you have your animation, you'll just want to export as .glb and you should be good to go!

## Just utilizing the Start Page
If you just want to add the start page to your existing experience, you'll use the [start_page_only folder](start_page_only).

[index.html](start_page_only/index.html) is the start page in its most basic form. All you need to change is the title and description of the experience, as well as where the link takes you. Currently, it will take you to the blank [experience.html](start_page_only/experience.html) file.

```html
<!-- Change experience.html below to your experience's html file -->
<a class="link" href="experience.html">
    <div>Start Experience</div>
</a>
```
If you want to take just the index.html file, don't forget that you'll also need the app.css to go along with it.