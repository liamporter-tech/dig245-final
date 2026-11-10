
# DIG 245 Final Project

Design and program a web application as a creative response to content from the course.


## Introduction

We’ve examined several issues around design and the internet this semester. Some forms are easy to identify, like how dark patterns manipulate user experiences by affecting usability and user expectations. Others, like the relationship between the surveillance economy and social justice are harder to visualize, but equally important when we consider whether the internet is or is not a positive force in society.

At the beginning of the semester, the [View Source](https://github.com/omundy/dig245-view-source) assignment asked you to think about why it is important to be able to know how a web page works “under the hood.” This final assignment challenges you to further investigate one or more of your preferred themes (from or related to the course) and conceive of and build a creative response in the form of a web application that likewise makes the topic more understandable, relevant, or transparent.

Your application will consist of HTML, CSS, Javascript, and any additional libraries you may need, but it should address the topic through an interactive experience that involves a user somehow inputting data, and your app transforming that data to reveal insights into your chosen topic.

## Camera data and caching

The Node server first uses DeFlock's published regional OpenStreetMap ALPR feed. It caches the feed index in memory for 15 minutes and each regional tile for one hour, then filters the tile data by the requested radius. Repeated searches in the same regions therefore avoid Overpass entirely. If DeFlock has no data for an area or its feed is unavailable, the server falls back to Overpass and caches an identical search for five minutes. These in-memory caches are cleared when the Node process restarts.

DeFlock's feed can lag behind OpenStreetMap. Search results show the feed's data date and warn when the feed index has expired. If the date is too old for your use, wait for DeFlock to refresh or use the Overpass fallback for areas not covered by its feed.



<details>
<summary>Learning Objectives, Preparation, Rubric</summary>

### Learning Objectives

Students who complete this assignment will be able to:

- Recall important social, political, and economic issues around design, the internet, and computing.
- Research, ideate, and plan a creative response to themes from the course content.
- Use design processes (grids, typography, design principles, and iteration) to create a custom responsive web application design.
- Use HTML, CSS, JS, and any additional frameworks or libraries to create a custom web application.


### Preparation

Complete the following to prepare for this assignment. See [Resources](#resources) for additional information as needed.

- Codecademy JS references [jquery introduction](https://github.com/omundy/learn-javascript/blob/main/reference-sheets/jquery-01-introduction.pdf), [effects](https://github.com/omundy/learn-javascript/blob/main/reference-sheets/jquery-02-effects.pdf), [jquery events](https://github.com/omundy/learn-javascript/blob/main/reference-sheets/jquery-03-events.pdf), [style methods](https://github.com/omundy/learn-javascript/blob/main/reference-sheets/jquery-04-style-methods.pdf), [dom traversing](https://github.com/omundy/learn-javascript/blob/main/reference-sheets/jquery-05-dom-traversing.pdf)
- [Codecademy: JS 7-1 Higher-Order Functions](https://www.codecademy.com/learn/introduction-to-javascript) (1-4)
- [Codecademy: JS 7-2 Iterators](https://www.codecademy.com/learn/introduction-to-javascript) (1-9)
- [Codecademy: JS 8-1 Objects](https://www.codecademy.com/learn/introduction-to-javascript) (1-10)

### Rubric

The final grade incorporates preparation scores with the final score ([rubric](https://docs.google.com/document/d/1gqAB_AHkMC6uKr_1uP9JzPwWclABw1RAB7KwEgAQSds/edit)).

```js
let milestones = ((concept + proposal + prototype + design) / 4) * 0.2;
let grade = milestones + (deliverables * 0.8);
```

</details>



<!--
[project development template](https://github.com/omundy/project-development-template)
-->

![flowchart](assets/img/5.2-design-prototype-separation.png)

<small>The following steps are represented in this diagram.</small>






## 1 - Concept

*Identify a topic, collect research, prepare a summary for a brainstorming session.*

1. **Identify potential topics** to explore. It shouldn't be too specific, nor too broad. Is there a specific problem you want to solve? Or do you wish to address issues by [problematizing](https://en.wikipedia.org/wiki/Problematization) your subject? (2-3 sentences)
1. **Collect research** (1-2 related articles, with summaries) **and examples** (3 links with summaries of inspiring / related projects). See the [Critical Web Design Index](https://criticalwebdesign.github.io/index) for inspiration.
1. **Identify new skills or technologies** (e.g. a design method, programming pattern, code library, etc.) you are interested to learn and could potentially use in your project.
1. **Write a summary** of your topic(s), research, and technology (3–4 sentences). Address why you are drawn to this topic and why it is important to explore. Identify the communities, resources, and issues involved. What [frameworks](https://docs.google.com/presentation/d/1OWc_e1pquvwKi4qxJShsZ1Rqia1dbDBcwpxYwdOic7o/edit#slide=id.g165f853ab3b_0_0) or methodologies might you use?
1. Bring the above to class for the...

<details>
<summary>In-class activity</summary>

In groups, brainstorm on your topic(s) use the <a href="https://omundy.github.io/project-development-template/materials/brainstorming-disney-method/index.html" target="_blank">Disney Creative Strategy</a>, which asks your group to assume different "hats" in order to ideate on concepts, solutions, and risks.

1. Everyone: post your subject or concept in Slack
1. As Dreamers, add new ideas for projects based on the subject to the posts in your group
    - How might you create something that helps others discuss, think about, or help to solve the issue?
    - The more ideas the better. Brainstorming aims to produce quantity, from which we select quality ideas.
    - No criticism. Our goal is to generate a pool of ideas. All ideas are welcome.
1. As Realists, after all have posted, talk about each in a group
    - Think more practically, about how you would put the ideas into practice.
1. After the session, explore the ideas and notes as a critic, to figure out what you can build in the given time

</details>


<details>
<summary>Related Articles</summary>


### Data Tracking

- 📚 Tobias Rose-Stockwell [This Is How Your Fear and Outrage Are Being Sold for Profit](https://medium.com/the-mission/the-enemy-in-our-feeds-e86511488de) (2017) 
- 📚 Steve Lambert [“Add-Art: Sharing, Freedom, and Beer”](https://visitsteve.com/made/the-add-art-story/) in Net Works: Case Studies in Web Art and Design (ed. xtine burrough) (2012) [add-art.org](https://add-art.org) (2011-)
- 📚 [Do Not Track documentary](https://donottrack-doc.com/en/episodes/) (2015)
- Design Lab: [Figma 101: Day 2 | Design an app screen](https://trydesignlab.com/figma-101-course/design-an-app-screen/)
- [Anatomy of a computer virus (Stuxnet)](https://vimeo.com/25118844) (3:21) | Ubermorgen [Vote-Auction](https://anthology.rhizome.org/vote-auction) (2000) | Steve Lambert [The Most Awkward 404 Page on the Internet](https://visitsteve.com/404) | [tosdr.org](https://tosdr.org/)




### Design & Power

- 📚 Wilneida Negrón [10 tech issues that will impact social justice in 2017](https://www.fordfoundation.org/ideas/equals-change-blog/posts/10-tech-issues-that-will-impact-social-justice-in-2017/) 
- 📚 Brooke Singer “Superfund365.org” in Net Works: Case Studies in Web Art and Design (ed. xtine burrough) (2012)
- 📚 George Aye [Design Education’s Big Gap: Understanding the Role of Power](https://medium.com/greater-good-studio/design-educations-big-gap-understanding-the-role-of-power-1ee1756b7f08) (2017)
- Brooke Singer [superfund365.org](https://superfund365.org) and [toxicsites.us](https://toxicsites.us) | Ben Grosser [Facebook Demetricator](http://bengrosser.com/projects/facebook-demetricator/) | fffff.at [Google Alarm extension](http://www.jamiedubs.com/googlealarm/) | JODI [geogoo.net](https://www.youtube.com/watch?v=7GB9Txb5_0E) | Daniel Temkin [esoteric.codes](https://esoteric.codes) 


</details>




## 2 - Proposal

Create a pitch deck (10-15 slide **Google Presentation**)* to share and plan your project that contains:

1. A one paragraph introduction to your concept and what you plan to make. Who will use this and why?
1. Audience - Who will use this and why? Write a [user story](https://www.atlassian.com/agile/project-management/user-stories) describing their goals.
1. An initial attempt at an [identity](https://docs.google.com/presentation/d/1exnY8fjVsOc3bKZFESJIM2s4JKxhqg_oASPDPokSfrE/edit?usp=sharing) (e.g. a logo, word mark, style guide, etc.).
1. Competition Scan - Examples (2–3) of similar works (in concept or tech) with images and links.
1. Flowcharts (2–3) showing each step users see, and another [showing how data works](https://www.google.com/search?q=a+flowchart+that+tracks+data+through+the+app&safe=off&tbm=isch) in the app
1. [Wireframes](https://www.dreamhost.com/blog/how-to-wireframe-website/) showing all the views in the interface (introduction page, forms, results page)
1. Technology - Include [pseudocode](https://en.wikipedia.org/wiki/Pseudocode) of the main logic of your project. List technologies and demos you think you will need. List the "**unknowns**"—parts of your idea that you don't know yet how to execute.
1. Does your project use data? What potential [sources](https://github.com/omundy/dig245-regenerative?tab=readme-ov-file#data-sources) will you use?




<details>
<summary>In-class activity (lightening talks)</summary>

##### <a href="https://en.wikipedia.org/wiki/Lightning_talk">Lightning talks</a> of your pitches
1. Share a link to your proposal in Slack.
1. Present slides. 3 minutes max.
1. 1 minute max for questions / comments. Add others in Slack thread.

</details>

<details>
<summary>In-class activity (speed dating)</summary>

##### Speed Dating

1. Find a partner.
1. Share your proposal, progress, and unknowns. (3 min)
1. Your partner should ask questions and make comments while you make notes. (1 min)
1. Switch roles and repeat the above.
1. Switch partners and repeat.

</details>






## 3 - Prototype

Create a working “proof of concept” of your app.

1. Fork this repository and clone it to your machine.
1. Your prototype should contain the essential functions of your project.
1. Your work should be live (able to be shared via a link in Slack)
1. Feel free to fork and use any example repository from class to get started.
1. [Save and refresh](https://github.com/omundy/learn-computing/blob/main/topics-keyboard-shortcuts.md#web-development-edit-save-refresh-loop) your work in the browser often to see your changes. Commit changes regularly.

<details>
<summary>In-class activity</summary>

In groups, share your prototypes to get feedback:

- Be ready to explain the current status of your work.
- Bring specific questions or unknowns (concept, design, tech) you would like to discuss with your group.

</details>





## 4 - Design

Design iterations of main views.

1. The design should reflect the overall concept and goals of your project.
1. Create your design iterations with [Figma](https://figma.com), using provided templates. **Show your work!** Do not delete previous versions—we want to see your progress as you iterate and improve your designs.
1. Include a [Moodboard](https://www.google.com/search?q=web+design+moodboard) showing your research into how others have designed solutions to similar information and design problems
1. Create multiple iterations of each different page / view your app.
1. As per class [presentations](https://docs.google.com/presentation/d/1BiIHVEQjmIb2k2vB6N3x1g_S3KSLyZq2YCniq1ONjg8/edit?usp=sharing), look at relevant examples of good design to help you improve your own, then experiment and iterate!
1. **Do not use AI-generated logos, icons, images, etc.** An important part of a design practice includes creating the ideas for these things and producing them yourself. At the very least, consider using royalty free images created by actual humans from [thenounproject.com](https://thenounproject.com/) or  [unsplash.com](https://unsplash.com/) instead of using whatever AI barfs up.


<details>
<summary>In-class activity</summary>

Share your iterations to get feedback before coding the final design.

- Bring to class: What are three questions you would like to ask each user of your potential design?
- In-class: [Design Critique: Imaginary Audience](https://docs.google.com/presentation/d/1BiIHVEQjmIb2k2vB6N3x1g_S3KSLyZq2YCniq1ONjg8/edit#slide=id.gf16dac508b_0_0)

</details>





## 5 - Design + Prototype


1. Combine your coded design and prototype
1. Your project should be 95% complete

<!--
Examples:

[Probability football](https://docs.google.com/presentation/d/1QO5ZFlc8GQilGughUaI57RlhQKc8TWECiqR7wkwjTwQ/edit#slide=id.p)

-->

<details>
<summary>In-class activity</summary>

- Be ready to explain the current status of your work.
- Bring specific questions or unknowns (concept, design, tech) you would like to discuss with your group.

</details>






## 6 - Deliverables

Your finished project should include:

#### The Project

1. Your coded design (valid [HTML](https://validator.w3.org/) and [CSS](https://jigsaw.w3.org/css-validator/) <sup>([?](https://github.com/omundy/dig245-critical-web-design/blob/main/topics/html-css/css.md#css-validation))</sup>) combined with your prototype in a final application.
1. About page: A well-designed, but simple page that contextualizes your project. It could appear as an introduction to the project or provided at the end to explain what happened.
1. The project should be live, hosted on Github Pages, Davidson Domains, or [some other server](https://github.com/omundy/learn-javascript/blob/main/topics/servers/servers.md).
1. 🤖 All AI-derived code must be attributed.


#### Documentation

1. A Google Presentation (update your original proposal with screenshots, text, flowcharts, etc.) to document and share your finished project.
1. A screencast video taken on your computer (do not use a cell phone!) (1:30 max) to demonstrate how your project works (see [tips](https://omundy.github.io/learn-computing/slides/documentation.html))
1. A 200–300 word statement explaining your concept and execution. This can be posted in Moodle, or included somehow in the actual project (e.g. the Intro page).
1. A link to (all of) your Figma layouts


#### Moodle Post

1. When finished, push, publish, and post all deliverables to Moodle per documentation in the Assignments.


<details>
<summary>In-class activity</summary>

Present your final project and plan for deliverables

1. Make sure your project is live and ready to share. Post a link to it and Figma in Slack.
1. Share your project in a small group (watch other use it, get specific feedback)
1. Then, we'll go around the room and those who wish can share with the whole class in a <a href="https://en.wikipedia.org/wiki/Lightning_talk">lightning talks</a> (3 min.) format.

</details>





<details>
<summary>Past examples</summary>

- 2025 
  - Delila [American User Stories](https://delila-cruz.github.io/dig245-final/)
  - Matthew [A visualization of the U.S. affordability crisis](https://matthewpearso.github.io/finscroll/)
  - Dmytro [Machine Learning Training Dynamics](https://dmku33.github.io/web-dev-project/)
- 2024
	- Pacis [T.O.S. Lens](https://n-pacis.github.io/dig245-final/) browser [extension](https://chromewebstore.google.com/detail/tos-lens/ebogajndhffhemjpkopgldlfilccodgc) [video](https://www.youtube.com/watch?v=ooLNfVshvMw&list=PLhpnnpt3tw-RiiFG9p_OJgjAfH-6kyAIK&index=2)
	- Mel [DC Navigator](https://hello2006-debug.github.io/dig245-final/)
	- Julia [Project Unsubscribe](https://siqjulia.github.io/dig245-final/)
	- Whitney [Mudgy](https://www.youtube.com/watch?v=l58RiptOuhk&list=PLhpnnpt3tw-RiiFG9p_OJgjAfH-6kyAIK&index=1)
- 2023
    - David and Tyler [Fortune Generator](https://davidmhilton.github.io/dig245-final)
    - Yumna and Jeremy [Fly on the Wall](https://yuahmed.github.io/fly-on-the-wall/)
    - Meredith [WanderWiser](https://merhaines.github.io/dig245-final/)
    - Richard [crackgrevocab.co](https://www.crackgrevocab.co/)
    - Will [ShareSpace](https://wcox2.github.io/dig245-final/)
    - Patrick [tswiftly.com](https://patrickleary.dcreate.domains/tswiftly/index.html)
    - David Y. [Graphify](https://graphify.stream/)
- 2022
    - Lillian [Social Mediator](https://limilano.github.io/dig245-final/)
    - Kate [More Than a Number](https://katehynes.github.io/dig245-final/) ([video](https://www.youtube.com/watch?v=DVVDX7hq6ew&list=PLhpnnpt3tw-RiiFG9p_OJgjAfH-6kyAIK&index=3))
    - Zoe [Diagnostic Survey Simulator](https://zoearen.github.io/dig245-final/) ([video](https://www.youtube.com/watch?v=57j6hTeJRvA&list=PLhpnnpt3tw-RiiFG9p_OJgjAfH-6kyAIK&index=5))
    - Bryce [Match Match Match](https://www.youtube.com/watch?v=bGqOcxWUBb4&list=PLhpnnpt3tw-RiiFG9p_OJgjAfH-6kyAIK&index=4) 😿
    - Ethan [Demystify](https://etgeorge.github.io/dig245-final)
    - Francisco [Art? or Not!](https://francduartemar.github.io/dig245-final)
    - Gaby [Color Generator](https://gasanclimenti.github.io/dig245-final) ([video](https://www.youtube.com/watch?v=2-phHrgeIig&list=PLhpnnpt3tw-RiiFG9p_OJgjAfH-6kyAIK))
    - Sky [Tennis (Aaronson Oracle)](https://skyyylaw.github.io/dig245-final/)
    - Pauline [Malicious Email Reporter](https://cha1hee.github.io/dig245-final/)
    - Drew [Hound](https://github.com/drew-beamer/dig245-final)†
    - Douglas [NotWatch](https://douglasdeutsch.github.io/dig245-final/)
- 2021
    - Annelise [Epilogues](https://anclaire.github.io/dig245-final/home.html)
    - Caroline [Dream-Bot](https://casigl.github.io/dig245-final/)† ([video](https://www.youtube.com/watch?v=RGzRBdYQbGo&list=PLhpnnpt3tw-RiiFG9p_OJgjAfH-6kyAIK&index=6)) 
    - Henry [Davidson College Scavenger Hunt](https://hehowell.github.io/Davidson-College-Scavenger-Hunt)
- 2020
    - Stine [The Scroll Calculator](https://github.com/stinilso/final-project)
- Past 
    - Holly and Thy [Vena Cava](https://www.youtube.com/watch?v=cVvKgnIUAPQ&list=PLhpnnpt3tw-RiiFG9p_OJgjAfH-6kyAIK&index=13) 😿 2015
    - Micky [The Web on Drugs](https://www.youtube.com/watch?v=QlJSAPCggo8&list=PLhpnnpt3tw-RiiFG9p_OJgjAfH-6kyAIK&index=15) browser extension 2012 
    - Dana [Giftorama](https://www.youtube.com/watch?v=10vWAl1tqDw&list=PLhpnnpt3tw-RiiFG9p_OJgjAfH-6kyAIK&index=15) 😿 2011
    - Jesse [Transient](https://www.youtube.com/watch?v=qdWQujr8--Y&list=PLhpnnpt3tw-RiiFG9p_OJgjAfH-6kyAIK&index=23) 😿 2010


😿 not currently live


</details>







## Resources

### Technology

- Course resources [HTML](https://github.com/omundy/dig245-critical-web-design/blob/main/topics/html-css/html.md), [CSS](https://github.com/omundy/dig245-critical-web-design/blob/main/topics/html-css/css.md), [JS](https://github.com/omundy/dig245-critical-web-design/blob/main/topics/javascript/javascript.md), [Figma](https://github.com/omundy/dig245-critical-web-design#figma), [Bootstrap](https://github.com/omundy/dig245-critical-web-design#bootstrap)
- [Mozilla Developer Guides](https://developer.mozilla.org/en-US/docs/Web/Guide)
