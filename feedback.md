# [Visual-AO-Notes](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Visual-AO-Notes "Visual-AO-Notes") Visual AO Notes

## [Initial-Impressions](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Initial-Impressions "Initial-Impressions") Initial Impressions

### [UI-Bug-Duplicate-Process-Display](https://hackmd.io/@dpshade22/BkAuUGH5yg\#UI-Bug-Duplicate-Process-Display "UI-Bug-Duplicate-Process-Display") UI Bug: Duplicate Process Display

- At first glance, there seems to be a UI bug displaying the same process multiple times.

![Screenshot 2025-02-20 at 3.54.40 PM](https://hackmd.io/_uploads/Sk39UMr9Je.png)

### [Handler-Code-Page-Overload](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Handler-Code-Page-Overload "Handler-Code-Page-Overload") Handler Code Page Overload

- The Handler code page feels overwhelming and confusing. The puzzle-style UI makes it look cluttered.

![Screenshot 2025-02-20 at 3.56.47 PM](https://hackmd.io/_uploads/BJnzvzBc1g.png)

### [Unclear-Input-Target-Label](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Unclear-Input-Target-Label "Unclear-Input-Target-Label") Unclear "Input Target" Label

- Wasn’t immediately clear what "Input Target" meant.

![Screenshot 2025-02-20 at 3.58.10 PM](https://hackmd.io/_uploads/HJydwzH91l.png)

### [Silent-Failure-Sending-Improper-Data](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Silent-Failure-Sending-Improper-Data "Silent-Failure-Sending-Improper-Data") Silent Failure Sending Improper Data

- Text like the following should enforce it as a string, as no variable can exist like this:
  - In fact, I tried to accidentally send this, and it executed with no red error anywhere indicating that what I tried sending was invalid. Needless to say, it didn't send properly with **Hi - from visual ao** as a variable

    ![Screenshot 2025-02-20 at 4.39.09 PM](https://hackmd.io/_uploads/B1KbWXS9yx.png)

### [Naming-Nodes](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Naming-Nodes "Naming-Nodes") Naming Node's

- When a node is given a name, the UI should update to show the name. Maybe add the node type as a subtitle.

### [Prepopulate-Actions](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Prepopulate-Actions "Prepopulate-Actions") Prepopulate Actions

- When importing a process, use Handlers.list to prepopulate possible actions (I think this is possible)

## [Usability-Feedback](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Usability-Feedback "Usability-Feedback") Usability Feedback

### [Unexpected-Arrow-Behavior](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Unexpected-Arrow-Behavior "Unexpected-Arrow-Behavior") Unexpected Arrow Behavior

- I expected the arrows above the nodes to shift focus between the left or right node, not swap their positions.

![Screenshot 2025-02-20 at 4.03.14 PM](https://hackmd.io/_uploads/SyRcOzB5yl.png)

### [Send-Node-Improvements](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Send-Node-Improvements "Send-Node-Improvements")"Send" Node Improvements

- The "Send" node should enforce a `Target` argument and suggest including `Tags` and `Data` for clarity.

![Screenshot 2025-02-20 at 4.11.35 PM](https://hackmd.io/_uploads/rJm99MH51l.png)

## [Handler-Code-Interface](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Handler-Code-Interface "Handler-Code-Interface") Handler Code Interface

### [Manual-Coding-Option](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Manual-Coding-Option "Manual-Coding-Option") Manual Coding Option

- I’d love the ability to manually write Handler code. Lua isn’t that tough, and the Scratch-style interface, while it may be useful for some, doesn’t feel as practical for building Handlers efficiently given LLMs exist.


#### [Templates-amp-LLM-Guidance](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Templates-amp-LLM-Guidance "Templates-amp-LLM-Guidance") Templates & LLM Guidance



  - Offering templates for common use cases would be a simpler starting point. Beginners already lean on LLMs for coding help—pairing templates with current best practices and documentation they can feed into an LLM would guide them effectively.

#### [Scratch-Interface-Limitations](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Scratch-Interface-Limitations "Scratch-Interface-Limitations") Scratch Interface Limitations

  - The Scratch interface feels clunky and restrictive. I can’t copy-paste or get precise LLM assistance, making it less convenient than direct code editing.

#### [Alternative-Suggestion](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Alternative-Suggestion "Alternative-Suggestion") Alternative Suggestion

  - Consider embedding a BetterIDEa environment (with an updated `ao` language server) as a smoother, more flexible option.

### [Multi-Process-Potential](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Multi-Process-Potential "Multi-Process-Potential") Multi-Process Potential

- Visual AO could really stand out by enhancing support for sending and receiving in multi-process scenarios.

### [Multi-Node-Select](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Multi-Node-Select "Multi-Node-Select") Multi-Node Select

- Would be great to select multiple nodes at once and drag them around, either with a mouse drag to select (similar to screenshot) or holding `cmd` or `shift` to highlight several simultaneously.

## [Process-Flow](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Process-Flow "Process-Flow") Process Flow

### [Current-Flow-Issues](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Current-Flow-Issues "Current-Flow-Issues") Current Flow Issues

- The existing flow doesn’t feel intuitive for an ao process.

![Screenshot 2025-02-20 at 4.22.18 PM](https://hackmd.io/_uploads/BkBGaGBcJg.png)

#### [Proposed-Improvements](https://hackmd.io/@dpshade22/BkAuUGH5yg\#Proposed-Improvements "Proposed-Improvements") Proposed Improvements

- A vertical structure makes more sense, letting me define multiple Handlers at once.

- The Play button could bind to all functions and Handlers that need defining upfront.

- Sending/receiving nodes could extend Handlers horizontally to `await` responses, improving clarity for ao’s async flow.

- In fact, Handler nodes could merely represent the definition of the Handler and it's pattern.


  - A Handler's output would be `msg` (or `env`, I think)
  - `msg` gets passed as an input to `code`/ `function` nodes
    - We could actually create a library of nodes for a given function and drag and drop it next to your handler to execute that function.

![Screenshot 2025-02-20 at 4.24.44 PM](https://hackmd.io/_uploads/HJYj6fS5yg.png)

* * *

- If you haven't seen iOS shortcuts, I highly recommend looking to see how shortcuts are defined. It's an incredibly effective low/no-code solution for automated workflows.