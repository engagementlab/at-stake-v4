using System;
using System.Linq;
using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;

namespace AtStake
{
  public class TestDemo
  { IWebDriver driver;
    
    string[] usernames = { "Bartholomew Shoe", "Weir Doe",
    "Abraham Pigeon", "Gunther Beard",
    "Hermann P. Schnitzel", "Nigel Nigel", "Fig Nelson",
    "Gibson Montgomery-Gibson", "Caspian Bellevedere",
    "Lance Bogrol", "Gustav Purpleson", "Inverness McKenzie"
    , "Dylan Meringue", "Archibald Northbottom",
    "Niles Peppertrout", "Brian Cumin", "Fleece Marigold",
    "Shequondolisa Bivouac", "Indigo Violet",
    "Natalya Undergrowth", "Wisteria Ravenclaw",
    "Rodney Artichoke", "Fletch Skinner", "Piff Jenkins",
    "Carnegie Mondover", "Valentino Morose", "Eric Widget",
    "Giles Posture", "Norman Gordon", "Gordon Norman",
    "Burgundy Flemming", "Girth Wiedenbauer",
    "Lurch Schpellchek", "Parsley Montana",
    "Fergus Douchebag", "Ursula Gurnmeister",
    "Bodrum Salvador", "Pelican Steve",
    "Gideon Guernsey-Marmaduke", "Druid Wensleydale",
    "Linguina Nettlewater", "Chaplain Mondover",
    "Jarvis Pepperspray", "Jonquil Von Haggerston",
    "Brandon Guidelines", "Sue Shei", "Ingredia Nutrisha",
    "Cecil Hipplington-Shoreditch", "Penny Tool",
    "Samuel Serif", "Manuel Internetiquette", "Eleanor Fant"
    , "Nathaneal Down", "Hanson Deck", "Desmond Eagle",
    "Richard Tea", "Quiche Hollandaise", "Hans Down",
    "Will Barrow", "Guy Mann", "Phillip Anthropy",
    "Benjamin Evalent", "Sir Cumference", "Dianne Ameter",
    "Alan Fresco", "Spruce Springclean", "Chauffina Carr",
    "Max Conversion", "Malcolm Function", "Ruby Von Rails",
    "Jason Response", "Jake Weary", "Justin Case",
    "Douglas Lyphe", "Ruüd van Driver", "Theodore Handle",
    "Hilary Ouse", "Dominic L. Ement", "Hugh Saturation",
    "Jackson Pot", "Elon Gated", "Russell Sprout",
    "Jim Séchen", "Hugh Millie-Yate", "Joss Sticks",
    "Thomas R. Toe", "Miles Tone", "Ravi O'Leigh",
    "Barry Tone"};

    [SetUp]
    public void startBrowser()
    {
      // driver = new ChromeDriver();

      var caps = new RemoteSessionSettings();
      caps.AddMetadataSetting("browserName", "iPhone");
      caps.AddMetadataSetting("device", "iPhone 8 Plus");
      caps.AddMetadataSetting("realMobile", "true");
      caps.AddMetadataSetting("os_version", "11");
      caps.AddMetadataSetting("browserstack.user", "engagementlab1");
      caps.AddMetadataSetting("browserstack.key", "JZ41mCB2nuWYzJhui7RN");
      caps.AddMetadataSetting("name", "Bstack-[C_sharp] Sample Test");
      
      driver = new RemoteWebDriver(
        new Uri("http://hub-cloud.browserstack.com/wd/hub/"), capability
      );
    }

    [Test]
    public void test()
    {
      driver.Navigate().GoToUrl("https://qa.atstakegame.org/");
      
      const int timeoutSeconds = 15;
      var ts = new TimeSpan(0, 0, timeoutSeconds);
      var wait = new WebDriverWait(driver, ts);
      
      driver.FindElement(By.Id("btn-new-game")).Click();

      wait.Until((driver) => driver.FindElement(By.Id("btn-deck-0")) != null);

      driver.FindElement(By.Id("btn-deck-0")).Click();
      
      wait.Until((driver) => driver.FindElement(By.Id("room-code")) != null);
      var roomCode = driver.FindElement(By.Id("room-code")).Text;
      
      ((IJavaScriptExecutor)driver).ExecuteScript("window.open();");
      driver.SwitchTo().Window(driver.WindowHandles.Last());
      driver.Navigate().GoToUrl("http://localhost:3000/");

      IWebElement joinCodeInput = null;
      driver.FindElement(By.Id("btn-join-game")).Click();
      wait.Until((driver) =>
      {
        joinCodeInput = driver.FindElement(By.Id("input-room-code"));
        return joinCodeInput != null;
      });
      var usernameInput = driver.FindElement(By.Id("input-name"));

      joinCodeInput.SendKeys(roomCode);
      usernameInput.SendKeys(usernames[new Random().Next(0, usernames.Length)]);
    }

    [TearDown]
    public void closeBrowser()
    {
      // driver.Close();
    }
    
  }
}