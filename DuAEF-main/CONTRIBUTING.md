**This document still needs to be completed...**

You can help to improve Duik and DuAEF by

- **documenting** the code and/or the tools;
- **translating** the tools;
- **fixing** issues;
- **proposing** new features;
- **implementing** new features.

:rocket: First of all, be sure to join us on our live chat [framateam](https://framateam.org/signup_user_complete/?id=scystqi16t8njnwhxbiuso94he), or on our [forum](http://forum.rainboxprod.coop/). We will be very happy to help you get started!

---

## Bug report / feature request

You can create a ticket on the [issues page](https://github.com/Rainbox-dev/DuAEF_Duik/issues) to [report a bug](https://github.com/Rainbox-dev/DuAEF_Duik/issues/new?template=bug.md) or [ask for a feature](https://github.com/Rainbox-dev/DuAEF_Duik/issues/new?template=feature_request.md). Please, give as much details as possible to help to tackle the issue :wink:

Use these templates to post your issue, but feel free to adjust it to your needs ;)

- [Report a bug](https://github.com/Rainbox-dev/DuAEF_Duik/issues/new?template=bug.md)
- [Request a feature](https://github.com/Rainbox-dev/DuAEF_Duik/issues/new?template=feature_request.md)

## Translations

...

## Code

This part is dedicated to help anyone who wants to contribute on the code of the tools or the library.

### Setup

You can skip this part if you are familiar with _git_ and developing Adobe scripts.
First of all, be sure to **fork** this repository. Then, clone it somewhere else than in the Adobe application folder. It will be easier because of the rights required to work in those folders.

```
# In C:/Users/.../Code for example
git clone git@github.com:[username]/DuAEF_Duik.git
```

We suggest you to directly create new remotes to not get confused. Remotes allow you to send your changes on a specific link. The default remote is named **origin** and is pointing to the link you used to clone. Since you are working on a fork, you will need another remote for pointing on the original repository that you will use when you want to get the most recent code.

```
git remote add duik git@github.com:Rainbox-dev/DuAEF_Duik.git # link for later purpose
```

Now, you need to create links to the tools you want to use in the After Effects Scripts folder. You will use `mklink` for the Windows' command line or `ln -s` for Mac and git bash.

For **DuAEF**:

```
mklink "C:\Program Files\Adobe\Adobe After Effects CC\Support Files\Scripts\ScriptUI Panels" "devFolder\DuAEF\src\DuAEF.jsxinc"

# /J is for linking a folder
mklink /J "C:\Program Files\Adobe\Adobe After Effects CC\Support Files\Scripts\ScriptUI Panels\libs" "devFolder\DuAEF\src\libs"

mklink /J "C:\Program Files\Adobe\Adobe After Effects CC\Support Files\Scripts\ScriptUI Panels\bin" "devFolder\DuAEF\src\bin"
```

If you want to link Duik, you need to link every file of Duik.
You will now be able to run your development version inside After Effects.
**Alternatively**, you could use [linkshellextension](http://schinagl.priv.at/nt/hardlinkshellext/linkshellextension.html) on Windows if you are not familiar with the command line.

### Pick a ticket

Generally, [all tickets labeled **Good First Issue**](https://github.com/Rainbox-dev/DuAEF_Duik/issues?q=is%3Aopen+is%3Aissue+label%3A%22Good+First+Issue%22) are a good place to start. But feel free to implement whatever you want, and if you don't know, ask us.

### Coding

Be sure to read the [Code guidelines](https://github.com/Rainbox-dev/DuAEF_Duik/wiki/Code-Guidelines).

Once you have chosen what to do, you can start to work ! You should work on a **new branch** every-time you implement something else. Here is an example:

```
git checkout master # Go back on master if you are not
git pull duik master # Retrieve the last version of the code
git checkout -b what-my-code-does # Create a new branch
# Code
# Test
# Code
# Test again
git add [files_you_modified]
git commit -m "What you do, with the id of the issue if possible (#1815)"
```

### Submit your code

Once you have committed your code, you can upload your branch on your fork.

```
git push origin what-my-code-does  # Send your branch on your fork
```

Then, you can [submit a pull request](https://github.com/Rainbox-dev/DuAEF_Duik/compare) with master/your-branch. We will then review your code and merge it or help you to improve it !

### Getting help

Here are some links that can help you:

- Web documentation of DuAEF: [rainbox-dev.github.io/DuAEF_Duik/](https://rainbox-dev.github.io/DuAEF_Duik/)
- JavaScript Tools Guide for Adobe CC: [estk.aenhancers.com](estk.aenhancers.com)
- After Effects Scripting Guide: [docs.aenhancers.com](http://docs.aenhancers.com/)
