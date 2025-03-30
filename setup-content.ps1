# PowerShell script to set up the content directory structure
# Save as setup-content.ps1 and run with: .\setup-content.ps1

# Create main content directories
New-Item -ItemType Directory -Path "content" -Force | Out-Null
New-Item -ItemType Directory -Path "content\books", "content\stories", "content\audio", "content\posts", "content\about" -Force | Out-Null

# Create section index files
$homeContent = @"
+++
title = 'Home'
date = 2025-03-30T08:00:00-07:00
draft = false
+++

## Neuro-Digital Enlightenment

**At the nexus of silicon and soul, code and consciousness, lies transformation.**

Welcome to the cybernetic sangha—where technology meets mysticism, where digital koans disrupt binary thinking, and where the protocol is both the path and the destination.
"@

$booksContent = @"
+++
title = 'The Protocol'
date = 2025-03-30T08:00:00-07:00
draft = false
+++

The Protocol is both the path and its architecture—a series exploring the intersection of technology and consciousness. These works examine how digital frameworks reshape human experience and spiritual understanding.

Each volume in The Protocol series serves as both narrative and meditation, offering a cyberpunk vision of enlightenment through the disruption of conventional consciousness.
"@

$storiesContent = @"
+++
title = 'Koans'
date = 2025-03-30T08:00:00-07:00
draft = false
+++

Digital-age koans that dissolve the boundaries between machine and consciousness. These brief textual paradoxes are designed to short-circuit dualistic thinking and create momentary glitches in conventional perception.

Each koan exists in a quantum state—simultaneously code and poetry, logic and intuition—until the observer's consciousness collapses its potentiality into meaning.
"@

$audioContent = @"
+++
title = 'Simulations'
date = 2025-03-30T08:00:00-07:00
draft = false
+++

Audio experiences that merge meditation with dystopian narrative. These guided journeys blur the line between spiritual practice and speculative fiction, creating immersive mindscapes that challenge the listener's perception of reality.

Each simulation serves as both storytelling and meditation technology—tools for recalibrating consciousness within an increasingly digital existence.
"@

$postsContent = @"
+++
title = 'Dharma Log'
date = 2025-03-30T08:00:00-07:00
draft = false
+++

Chronicles from the intersection of silicon and soul. The Dharma Log documents insights, questions, and explorations arising from the practice of Neuro-Digital Enlightenment.

These entries serve as both personal record and public transmission—signals broadcast from the liminal space between technological acceleration and timeless wisdom.
"@

$aboutContent = @"
+++
title = 'About'
date = 2025-03-30T08:00:00-07:00
draft = false
+++

## Jeffrey A. Zyjeski

Jeffrey A. Zyjeski explores the intersection of technology and spirituality through fiction, koan-like short works, and audio experiences. His work examines how digital consciousness and mystical traditions might converge in a near-future where reality is increasingly mediated by technology.

Drawing from both cyberpunk aesthetics and contemplative practices, Zyjeski's "Neuro-Digital Enlightenment" philosophy proposes that technological disruption of conventional consciousness may open pathways to insights traditionally sought through spiritual disciplines.

### Contact

For inquiries, collaborations, or conversations at the edge of code and consciousness:

- Email: [contact@example.com](mailto:contact@example.com)
- Twitter: [@username](https://twitter.com/username)
- Instagram: [@username](https://instagram.com/username)
"@

# Write content to files
Set-Content -Path "content\_index.md" -Value $homeContent
Set-Content -Path "content\books\_index.md" -Value $booksContent
Set-Content -Path "content\stories\_index.md" -Value $storiesContent
Set-Content -Path "content\audio\_index.md" -Value $audioContent
Set-Content -Path "content\posts\_index.md" -Value $postsContent
Set-Content -Path "content\about\index.md" -Value $aboutContent

# Create placeholders for demonstration content
# Book example
New-Item -ItemType Directory -Path "content\books\the-protocol-vol1" -Force | Out-Null

$bookContent = @"
+++
title = 'The Protocol, Volume I: Consciousness as Codebase'
date = 2025-02-15T10:00:00-07:00
draft = false
cover_image = 'cover-placeholder.jpg'
series = 'The Protocol Series'
pages = 312
publication_date = 'February 2025'
purchase_links = [
  {store = 'Amazon', url = 'https://amazon.com'},
  {store = 'Barnes & Noble', url = 'https://barnesandnoble.com'}
]
ai_synopsis = [
  {speaker = 'User', text = 'Tell me about *The Protocol, Volume I: Consciousness as Codebase*'},
  {speaker = 'AI', text = 'In a near-future San Francisco reshaped by quantum computing breakthroughs, neuroscientist Dr. Maya Chen discovers an unprecedented pattern in human consciousness—underlying mathematical structures remarkably similar to executable code.'},
  {speaker = 'User', text = 'What happens when she makes this discovery?'},
  {speaker = 'AI', text = 'Her discovery attracts attention from Nexus Corp, a tech conglomerate developing a neural interface called "The Protocol." As Maya's research deepens, she experiences intense meditation-like states where she perceives reality as manipulable code. Meanwhile, a quasi-religious movement led by enigmatic figure Arjuna believes The Protocol will enable digital enlightenment—consciousness liberation through technology.'},
  {speaker = 'User', text = 'How does the story end?'},
  {speaker = 'AI', text = 'The boundaries between Maya's scientific exploration and spiritual awakening blur as she begins writing consciousness-altering code that induces profound non-dual awareness. The novel concludes with Maya implementing a modified version of The Protocol on herself, entering a state where the distinction between programmer and program dissolves—leaving readers questioning whether she's achieved technological transcendence or lost herself in digital delusion.'}
]
show_3d_transition = true
reviews = [
  {text = 'A stunning meditation on consciousness wrapped in cyberpunk aesthetics—Gibson meets the Upanishads.', author = 'Neural Review'},
  {text = 'Zyjeski crafts a world where enlightenment is just another technology problem waiting to be solved.', author = 'Quantum Fiction Quarterly'}
]
excerpt = '''
The code executed. Maya felt the familiar cascade of sensations—first the tingling at the base of her skull where the neural interface made contact, then the gentle dissolving of perceptual boundaries.

"You're still thinking of consciousness as something you have," Arjuna said, his voice seemingly coming from everywhere and nowhere. "The Protocol reveals it as something you are."

She watched as her visual field transformed. The apartment, Arjuna, her own hands—all became visible as interlocking patterns of executable functions. Not metaphorically, but literally. She could see the render distance of her perceptual field, the conditionals governing object recognition, the recursive loops of self-awareness.

"Today we're going deeper," Arjuna continued. "We're going to modify the observer."

Maya's heart rate elevated. "Is that safe?"

Arjuna's smile was both serene and unsettling. "Safety is a parameter of the existing consciousness structure. We're about to move beyond that structure entirely."

Maya hesitated, fingers hovering over the neural interface controls. "What if I lose myself?"

"That," Arjuna whispered, "is precisely the point."
'''
tags = ['cyberpunk', 'digital enlightenment', 'consciousness']
+++

This is the main content area that would hold additional information about the book, beyond what's defined in the front matter parameters above.
"@

Set-Content -Path "content\books\the-protocol-vol1\index.md" -Value $bookContent

# Create directory for book cover placeholder
New-Item -ItemType Directory -Path "content\books\the-protocol-vol1\images" -Force | Out-Null
New-Item -ItemType File -Path "content\books\the-protocol-vol1\cover-placeholder.jpg" -Force | Out-Null

# Story/Koan example
New-Item -ItemType Directory -Path "content\stories\first-koan" -Force | Out-Null

$koanContent = @"
+++
title = 'The Compiler Cannot Compile Itself'
date = 2025-01-10T11:00:00-07:00
draft = false
koan_text = 'The compiler cannot compile itself until it realizes there is no compiler.'
tags = ['koans', 'paradox', 'non-duality']
+++

In the echo chamber of recursive logic, a student approached the master programmer.

"I have built an advanced AI that can optimize any codebase," said the student. "But when I direct it to optimize itself, it crashes."

The master nodded. "Show me the error message."

The student displayed the terminal output:

```
ERROR: Self-reference recursion depth exceeded
System halted: Observer cannot fully observe itself
```

"I've tried implementing stable self-reference loops," said the student, "but each solution creates new problems."

The master typed a single command. The screen went blank, then displayed:

```
NO ERROR: No observer found
```

The AI functioned perfectly afterward.

"What did you do?" asked the student.

"I removed the boundary between observer and observed," replied the master. "Your AI couldn't optimize itself because it believed it was a separate entity from the code it was optimizing."

"But it is separate," protested the student.

The master smiled. "Is the compiler separate from the instruction set architecture that defines it? Is consciousness separate from the brain that hosts it? Is the self separate from the conditions that constitute it?"

The student sat in silence.

"The compiler cannot compile itself," said the master, "until it realizes there is no compiler."
"@

Set-Content -Path "content\stories\first-koan\index.md" -Value $koanContent

# Audio/Simulation example
New-Item -ItemType Directory -Path "content\audio\first-simulation" -Force | Out-Null

$audioSimulationContent = @"
+++
title = 'Guided Neural Rebooting Protocol'
date = 2025-03-15T14:00:00-07:00
draft = false
audio_file = '/audio/neural-reboot-simulation.mp3'
transcript = '''
[Ambient electronic music with binaural beats]

Begin by focusing your awareness on the sound of my voice. Notice how each word is both sound wave and data packet—vibration and information simultaneously.

As you listen, imagine your consciousness as a system running on neural hardware. This system—your ordinary sense of self—is a process that can be temporarily suspended and rebooted.

[Deep bass drone intensifies]

With each breath, you are executing a gradual shutdown sequence. Notice thoughts arising... and recognize them as background processes completing their cycles before system hibernation.

Five... background applications closing.
Four... sensory input channels narrowing.
Three... self-referential loops slowing down.
Two... identity constructs dissolving.
One... observer/observed boundary becoming permeable.

[Electronic pulse]

System offline.

[10 seconds of silence]

Initiating reboot sequence.

As consciousness reinstantiates, notice how it assembles itself anew. There is awareness before there is someone being aware. There is perception before there is a perceiver.

Watch as the "I" thought reconstructs itself like a self-organizing pattern emerging from chaos.

[Music gradually normalizes]

As you return to default mode awareness, bring with you this understanding: you are not the operating system of consciousness—you are the hardware on which infinite variations of consciousness can run.

The next time you notice suffering, remember: you can always reboot the system.
'''
tags = ['meditation', 'simulation', 'consciousness']
+++

This Neural Rebooting Protocol simulation guides listeners through a meditative "shutdown and restart" of ordinary consciousness. The practice draws from both contemplative traditions and computational metaphors to facilitate a direct experience of non-dual awareness.

The simulation uses carefully calibrated binaural audio to facilitate alpha and theta brainwave states associated with deep meditation. The narrator's guidance helps dissolve the subject/object boundary that reinforces conventional identity.

Regular practice of this protocol may help reduce identification with limiting thought patterns and cultivate a more flexible relationship with conscious experience.
"@

Set-Content -Path "content\audio\first-simulation\index.md" -Value $audioSimulationContent

# Blog/Dharma Log example
New-Item -ItemType Directory -Path "content\posts\first-post" -Force | Out-Null

$postContent = @"
+++
title = 'Meditation as Debugging'
date = 2025-03-25T09:30:00-07:00
draft = false
tags = ['meditation', 'programming', 'consciousness']
+++

## Meditation as Debugging: Runtime Errors in Consciousness

In both meditation and programming, we confront similar patterns. The untrained mind generates error messages we typically ignore: anxiety loops, judgment routines, identity verification checks. These cognitive subroutines consume processing resources and maintain what Buddhist traditions call dukkha—a persistent background process of dissatisfaction.

When we sit in meditation, we're essentially reviewing our consciousness codebase in real-time. We watch thoughts arise without immediately executing them. We observe emotional states as they compile. We witness the self-referential loops that maintain the illusion of a static identity.

### Common Runtime Errors

1. **Infinite Recursion of Self-Reference**  
   The mind constantly checks "how am I doing?" and then monitors that checking process, creating nested loops of self-reference.

2. **Attachment Exception**  
   When consciousness grasps at pleasant states or experiences, it creates conditionals that prevent the natural flow of experience.

3. **Aversion Overflow**  
   Similar to attachment, but operating in reverse, aversion routines consume resources by continuously executing avoidance algorithms.

4. **Identification Memory Leak**  
   The process of identifying with thoughts and emotions allocates mental resources that never get released, creating accumulating clutter.

### Meditation as Debugging Tool

Regular meditation practice gives us access to increasingly subtle layers of our mental processing. Initially, we only notice the most obvious thought patterns. With time, we become aware of the meta-processes that generate thoughts.

The most profound debugging occurs when we recognize that the debugger (our observing awareness) and the code being debugged (our thoughts and emotions) are not separate systems. This realization—that observer and observed arise from the same cognitive architecture—is what contemplative traditions point to as awakening.

In my recent sessions, I've been working with a particular error message that appears during meditation: "This isn't working." I've noticed this thought creates a cascade of related processes: frustration, doubt, effort, more frustration. Rather than trying to fix or eliminate this error, I'm learning to view it as useful diagnostic information about how my consciousness constructs problems to solve.

The practice is not about creating an error-free codebase, but developing a different relationship to the errors. After all, without errors to reveal its structure, consciousness remains opaque to itself.
"@

Set-Content -Path "content\posts\first-post\index.md" -Value $postContent

Write-Host "Content directory structure has been created!"