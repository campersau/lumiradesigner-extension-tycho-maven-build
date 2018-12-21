# SAP Lumira Designer (DesignStudio) Extension build using Eclipse Tycho with Maven

Building SAP Lumira Designer (DesignStudio) Extension with Eclipse is not very reliable (at least for me) and does not work with CI build systems.

So here is how to build these plugins with Eclipse Tycho and Maven.

## Adding `pom.xml` files

Inside the plugin folders add `pom.xml` files with the `packaging` set to `eclipse-plugin`.

```xml
<packaging>eclipse-plugin</packaging>
```

Inside the feature folder add a `pom.xml` file with `packaging` set to `eclipse-feature`.

```xml
<packaging>eclipse-feature</packaging>
```

Inside the repository folder add a `pom.xml` file with `packaging` set to `eclipse-repository`.

```xml
<packaging>eclipse-repository</packaging>
```

The parent `pom.xml` file is a bit more complex as it includes the references to the plugins, feature and repository folder, lists the repositories for dependency resolution and configures the various Tycho Maven plugins. See [this `pom.xml`](./pom.xml) for an example.

## Lumira Designer p2 repository

To resolve the dependencies for the Lumira Designer Plugins, e.g. `com.sap.ip.bi.zen.rt.components.sdk.eclipse`, we need to create a custom p2 repository, because Tycho does only support that format.

For that we can convert the Lumira Designer installation folder into a p2 repository using the following [eclipse command](https://wiki.eclipse.org/Equinox/p2/Publisher#Features_And_Bundles_Publisher_Application) (assuming the installation directory for Lumira Designer is `C:\Program Files\SAP Lumira\Lumira Designer`):

```
> "C:\Program Files\eclipse\eclipse.exe" -debug -consolelog -nosplash -verbose -application org.eclipse.equinox.p2.publisher.FeaturesAndBundlesPublisher -metadataRepository file:"C:\Program Files\SAP Lumira\Lumira Designer" -artifactRepository file:"C:\Program Files\SAP Lumira\Lumira Designer" -source "C:\Program Files\SAP Lumira\Lumira Designer" -compress -append -publishArtifacts
```

After that we can add it to the parent `pom.xml` file like this:
```xml
<repository>
    <id>lumiradesigner</id>
    <layout>p2</layout>
    <url>file:///C:/Program%20Files/SAP%20Lumira/Lumira%20Designer</url>
</repository>
```

Because of an [old bug](https://bugs.eclipse.org/bugs/show_bug.cgi?id=453318) in Tycho it is not possible to upload the repository to an HTTP server and using it from there.

## Versioning

Because all version numbers are now duplicated in the `pom.xml` and `MANIFEST.MF` files Tycho has a command to update all of these at once.

```
> mvn org.eclipse.tycho:tycho-versions-plugin:set-version -DnewVersion=x.x.x-SNAPSHOT
```

Sadly the versions inside the `contribution.xml` files need to be updated manually.

### Qualifier

The qualifier (e.g. the `-SNAPSHOT` part) can be changed by adding `-DforceContextQualifier=xxx` to the build command. See [here](https://wiki.eclipse.org/Tycho/FAQ#How_do_I_embed_a_configurable_build_version.3F).

The `forceContextQualifier` is not used automatically for the repository zip file name. But we can change that by configuring the `tycho-p2-repository-plugin` with a `finalName`.

```xml
<plugin>
    <groupId>org.eclipse.tycho</groupId>
    <artifactId>tycho-p2-repository-plugin</artifactId>
    <version>${tycho-version}</version>
    <configuration>
        <finalName>${project.artifactId}-${unqualifiedVersion}.${buildQualifier}</finalName>
    </configuration>
</plugin>
```

## Output Directory

For CI builds it is common to change the build output directory for easier artifact creation.
This can be done by adding a custom property (e.g. `outputDirectory`) and using it for the build command (`-DoutputDirectory`).

```xml
<properties>
    <outputDirectory>${maven.multiModuleProjectDirectory}/target</outputDirectory>
</properties>
...
<build>
    <directory>${outputDirectory}/${project.artifactId}</directory>
</build>
```

An example CI build command can look like this:

```
> mvn clean package -DforceContextQualifier=ci-$(Build.BuildId) -DoutputDirectory=$(Build.ArtifactStagingDirectory)
```
