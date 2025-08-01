

### **A Curriculum for Mastering Bootable Containers with `bootc`**


-----

### **Module 1: The Big Picture - Why Bootable Containers?**

**Goal:** Understand the vision behind `bootc` and why image-based operating systems are a transformative approach to system management.

  * **1.1: The Vision from the Experts**
      *  **Video:** [Bootable Containers A deep dive into image based OS - Fedora Flock 2024 ](https://www.youtube.com/watch%3Fv%3Ds_t40323sE0) - A foundational talk by Dan Walsh (creator of SELinux & Podman).
      *  **Video:** [Keynote: Revolutionize your OS deploy and management with bootc containers - DevConf.CZ 2025](https://pretalx.devconf.info/devconf-cz-2025/talk/YT9CKK/) - A keynote presentation on the revolutionary potential of `bootc`.
  * **1.2: Core Project & Foundational Concepts**
      *  [bootc-dev/bootc - GitHub](https://github.com/bootc-dev/bootc) - The official project repository.
            * [Bootc Documentation](https://bootc-dev.github.io/bootc/)
      *  [Getting Started with Bootable Containers - Fedora Documentation](https://docs.fedoraproject.org/en-US/bootc/) - A maybe outdated guide explaining the core concepts.
  * **1.3: The Future is Now: CNCF and Community**
      *  [Shape the Future of Linux: Contribute to bootc Open Source Project | Red Hat Developer](https://www.google.com/search?q=https://developers.redhat.com/articles/2024/06/11/shape-future-linux-contribute-bootc-open-source-project) - Discusses `bootc`'s acceptance into the CNCF Sandbox.

-----

### **Module 2: Under the Hood - How `bootc` Works**

**Goal:** Gain a technical understanding of how a container image becomes a running, bootable operating system.

  * **2.1: The Installation Process**
      *  [Understanding `bootc-image-builder`](https://github.com/osbuild/bootc-image-builder) - Main tool for building Disk images from Bootc images.
  * **2.2: The Bootc Filesystem**
      *  [Filesystem - `bootc`](https://docs.fedoraproject.org/en-US/bootc/filesystem/) - Explains the read-only `/usr` and persistent `/etc`/`/var` layout.
  * **2.3: Provisioning and Advanced Use Cases**
      *  [System provisioning and `bootc`, now and the future :: DevConf.CZ 2025](https://www.youtube.com/watch?v=2OrumHcgdvk) - A talk by Colin Walters (maintainer of `bootc`) on provisioning.
      *  [How pre-tuned real-time bootable containers work | Red Hat Developer](https://developers.redhat.com/articles/2025/03/06/how-pre-tuned-real-time-bootable-containers-work) - A technical article on using `bootc` for real-time workloads.

-----

### **Module 3: Exploring the Ecosystem - What's Already Out There?**

**Goal:** Discover the wide variety of pre-built `bootc` images available.

  * **3.1: The Foundational Base Images**
      * **Fedora:** `quay.io/fedora/fedora-bootc:42`
      * **CentOS Stream:** `quay.io/centos-bootc/centos-bootc:stream10`
      * **AlmaLinux:** `quay.io/almalinuxorg/almalinux-bootc:10`
  * **3.2: Community-Driven Desktop Images**
      * **Universal Blue:** [Project Homepage](https://universal-blue.org/)
      * **The Tuna-OS Family:** [tuna-os/tunaOS on GitHub](https://github.com/tuna-os/tunaOS) (Yellowfin, Albacore, Bluefin-tuna, Redfin).
      * **Other Desktops:** AlmaLinux Atomic Desktops, HeliumOS.
  * **3.3: Edge & Server Deployments**
      *  [RamaEdge/os-builder](https://github.com/RamaEdge/os-builder) - Example of `k3s` and `Microshift` baked into `bootc` images.

-----

### **Module 4: Let's Build\! - Creating Your Own Custom OS**

**Goal:** Transition from a consumer to a creator. Build, customize, and manage your own bootable container image.

  * **4.1: The Starting Point for Desktops**
      *  [ublue-os/image-template](https://github.com/ublue-os/image-template) - The recommended template for creating your own customized desktop OS using GitHub Actions.
  * **4.2: Best Practices for Building Images**
      *  [Building images - `bootc` Documentation](https://bootc-dev.github.io/bootc/building/guidance.html) - Official guidance on creating robust and maintainable images.
      * [Best Practices for Building Bootable Containers](https://developers.redhat.com/articles/2025/02/26/best-practices-building-bootable-containers)
  * **4.3: Self-Hosting a GitOps Pipeline**
      *  [Self-hosting `bootc` images for desktop and server](https://mrguitar.net/?p=2627) - An excellent guide on setting up your own GitOps pipeline to build and manage `bootc` images, giving you full control over your infrastructure.
  * **4.4: For the Nix-heads: Integrating Your Development Workflow**
      *  [Managing Your Laptop with Bootable Containers, Fedora Toolbox, Nix, and Home Manager :: DevConf.CZ 2025](https://www.youtube.com/watch?v=P9XydScZZzs) - Explains how to combine an immutable OS with the flexibility of Nix for development.

-----

### **Module 5: Advanced Topics - Security & Automation**

**Goal:** Secure your custom images by integrating modern security practices directly into your build pipeline.

  * **5.1: Generating a Software Bill of Materials (SBOM)**
      * **Tool:** [Syft](https://github.com/anchore/syft) - For generating SBOMs from container images.
      * **Reference:** Example `bootc` repo using Syft and Grype for SBOM and vulnerability scanning.
  * **5.2: Automated Vulnerability Scanning**
      * **Tool:** [Trivy](https://github.com/aquasecurity/trivy) - A comprehensive vulnerability scanner.
      * **Reference:** [Trivy-scan Example GitHub Action](https://github.com/aquasecurity/trivy-action) for CI/CD integration.