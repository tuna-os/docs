

---

### **Intro**

* [What are Bootable Containers? - IBM Tech](https://www.youtube.com/watch?v=cBom7aDuy9w)
* [Flock 2024 Bootable Containers A deep dive into image based OS](https://www.youtube.com/watch?v=uNZuYBq5XfI) \- [Dan Walsh](https://www.redhat.com/en/authors/dan-walsh) (Father of SELinux/Podman)  
* [**bootc-dev/bootc: Boot and upgrade via container images \- GitHub**](https://github.com/bootc-dev/bootc)  
  * The official project repository, a great place to start for a high-level overview of the project's goals, status, and community.  
* [**Getting Started with Bootable Containers \- Fedora Documentation**](https://docs.fedoraproject.org/en-US/bootc/getting-started/)  
  * A foundational guide that explains the core concepts, benefits, and how to start using bootable containers.  
    ---

    ### **How It Works**

* [**Understanding bootc install**](https://bootc-dev.github.io/bootc//bootc-install.html)  
  * A deep dive into the bootc install command, which is the core of how a container image becomes a bootable system. It explains the process of writing to disk and setting up the bootloader.  
* [**Filesystem \- bootc**](https://bootc-dev.github.io/bootc/filesystem.html)  
  * Explains the immutable filesystem layout of a bootc system, with /usr being read-only and /etc and /var being used for persistent, mutable data.  
* [**How pre-tuned real-time bootable containers work | Red Hat Developer**](https://developers.redhat.com/articles/2025/03/06/how-pre-tuned-real-time-bootable-containers-work)  
  * A technical article that provides an example of using bootc for real-time workloads, offering a peek into its internal mechanisms and customization.  
* 

  ---

  ### **What about Nix?**

* [Nix-Fedora-Toolbox](https://thrix.github.io/nix-toolbox/)  
* [Managing Your Laptop with Bootable Containers, Fedora Toolbox, Nix, and Home Manager :: DevConf.CZ 2025](https://pretalx.devconf.info/devconf-cz-2025/talk/G9JURJ/)

  ---

  ### **Deploying with Bootc on Bare Metal (in the cloud)**

* [System provisioning and bootc, now and the future :: DevConf.CZ 2025](https://pretalx.devconf.info/devconf-cz-2025/talk/RKW3WM/) \- [Colin Walters](https://www.redhat.com/en/authors/colin-walters) (OPenshift/CoreOS, Maintainer of Bootc)  
* Great Example \- [https://github.com/RamaEdge/os-builder](https://github.com/RamaEdge/os-builder)  
  * Ravi Chillerega \- k3s and Microshift baked in to bootc images for deployment to edge devices  
* [Keynote: Revolutionize your OS deploy and management with bootc containers :: DevConf.CZ 2025](https://pretalx.devconf.info/devconf-cz-2025/talk/YT9CKK/)

  ---

  ### **Desktop building with Bootc**

* [ublue-os/image-template: Build your own custom Universal ... \- GitHub](https://github.com/ublue-os/image-template)  
  * This is where you should start if you want to make your own desktop OS image  
* [Universal Blue – Powered by the future, delivered today](https://universal-blue.org/)  
  * Universal Blue offers custom, immutable Atomic Desktop images, streamlining the creation and management of pre-configured OS environments using bootc for modern deployment.  
* [Red Hat / centos-stream / containers / bootc \- GitLab](https://gitlab.com/redhat/centos-stream/containers/bootc) \- CentOS Bootc Base images  
  * quay.io/centos-bootc/centos-bootc:stream10  
* [Fedora / bootc / Base Images \- GitLab](https://gitlab.com/fedora/bootc/base-images) \- Fedora Bootc Base Images  
  * quay.io/fedora/fedora-bootc:42  
* [AlmaLinux/bootc-images \- GitHub](https://github.com/AlmaLinux/bootc-images) \- Almalinux Bootc Base images  
  * `quay.io/almalinuxorg/almalinux-bootc:10`  
  * [AlmaLinux/atomic-desktop \- GitHub](https://github.com/AlmaLinux/atomic-desktop) \- KDE \+ GNOME base images  
    * [AlmaLinux/atomic-workstation \- GitHub](https://github.com/AlmaLinux/atomic-workstation) \- More Opinionated GNOME workstation baes on AlmaLInux  
* [https://github.com/tuna-os/tunaOS](https://github.com/tuna-os/tunaOS)  
  * Forks of [Bluefin LTS](https://github.com/ublue-os/bluefin-lts/releases) bringing most of the goodies to other base images  
    * Yellowfin \- Almalinux 10 Kitten (synced with CentOS 10\)  
    * Albacore \- Almalinux 10 (synced with RHEL/EL 10\)  
    * Bluefin-tuna \- Fedora 42 (using newer, pure bootc, unlike Bluefin)  
    * Redfin \- RHEL 10  
* [HeliumOS](https://www.heliumos.org/) \- KDE CentOS-based desktop image  
* [EU-OS](https://eu-os.eu/) \- Community-led Proof-Of-Concept of a Public-use OS for EU  
* [ublue-os/aurora-lts: Aurora Helium \- GitHub](https://github.com/ublue-os/aurora-lts) \- CentOS companion to [ublue-os/aurora: The ultimate productivity workstation \- GitHub](https://github.com/ublue-os/aurora) **Needs maintainers\!\!**

  ---

  ### **Security**

  * Syft \- SBOM  
    * [out of memory exception when scanning images (here: fedora-bootc …](https://github.com/anchore/syft/issues/3800)  
    * [Syft SBOM in a GHA](https://github.com/ublue-os/bluefin-lts/blob/bce36a272851767cb805df8e73458b902f44f67c/.github/workflows/reusable-build-image.yml#L163)  
    * [Example bootc repo using Syft and Grype](https://github.com/SNThrailkill/Bootc-Fedora) (SBOM and Vuln-scanning)  
  * Trivy \- SARIF Vuln scan  
    * [Trivy-scan Example](https://github.com/RamaEdge/os-builder/blob/main/.github/actions/trivy-scan/action.yml)

    ---

    ### **Future & Best Practices**

* [**Shape the Future of Linux: Contribute to bootc Open Source Project | Red Hat Developer**](https://developers.redhat.com/blog/2025/07/23/shape-future-linux-contribute-bootc-open-source-project)  
  * A recent blog post discussing bootc's acceptance into the **CNCF Sandbox**, its evolution, and the benefits of contributing to the project.  
* [**Building images \- bootc**](https://bootc-dev.github.io/bootc//building/guidance.html)  
  * Provides guidance on best practices for building bootc\-compatible images, including how to handle configuration files and nested containers. It also discusses the project's vision for the future.  
  * 
